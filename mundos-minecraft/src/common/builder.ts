/**
 * Constructor de escenarios: genera el "mundo" temático (aldea, foro, puesto
 * desértico…) la primera vez que alguien entra. Las operaciones se encolan en
 * un Plan y se ejecutan repartidas en varios ticks con system.runJob para no
 * provocar el "watchdog" del servidor ni tirones en la consola.
 */
import {
  BlockPermutation,
  BlockVolume,
  CommandPermissionLevel,
  CustomCommandStatus,
  Dimension,
  ItemStack,
  Player,
  system,
  Vector3,
  world,
} from "@minecraft/server";
import { safe } from "./util.js";

type BlockSpec = string | BlockPermutation;
type Op = () => void;

const MAX_FILL = 4096;

export class Plan {
  readonly ops: Op[] = [];
  constructor(
    readonly dim: Dimension,
    readonly origin: Vector3,
  ) {}

  private abs(x: number, y: number, z: number): Vector3 {
    return { x: Math.floor(this.origin.x + x), y: Math.floor(this.origin.y + y), z: Math.floor(this.origin.z + z) };
  }

  /** Rellena una caja (coordenadas relativas, ambos extremos incluidos). */
  fill(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, block: BlockSpec): this {
    const [ax, bx] = [Math.min(x1, x2), Math.max(x1, x2)];
    const [ay, by] = [Math.min(y1, y2), Math.max(y1, y2)];
    const [az, bz] = [Math.min(z1, z2), Math.max(z1, z2)];
    // Trocea en bloques <= MAX_FILL para respetar el límite de fillBlocks.
    const sx = bx - ax + 1;
    const sz = bz - az + 1;
    const layer = sx * sz;
    if (layer <= MAX_FILL) {
      const step = Math.max(1, Math.floor(MAX_FILL / layer));
      for (let y = ay; y <= by; y += step) {
        const yTop = Math.min(by, y + step - 1);
        this.ops.push(() => {
          this.dim.fillBlocks(new BlockVolume(this.abs(ax, y, az), this.abs(bx, yTop, bz)), block);
        });
      }
    } else {
      for (let x = ax; x <= bx; x += 16)
        for (let z = az; z <= bz; z += 16) this.fill(x, ay, z, Math.min(bx, x + 15), by, Math.min(bz, z + 15), block);
    }
    return this;
  }

  set(x: number, y: number, z: number, block: BlockSpec): this {
    this.ops.push(() => {
      const b = this.dim.getBlock(this.abs(x, y, z));
      if (!b) return;
      if (typeof block === "string") b.setType(block);
      else b.setPermutation(block);
    });
    return this;
  }

  /** Cilindro vertical (hueco => solo la pared). */
  cylinder(cx: number, cz: number, y1: number, y2: number, r: number, block: BlockSpec, hollow = false): this {
    for (let x = -r; x <= r; x++)
      for (let z = -r; z <= r; z++) {
        const d = Math.hypot(x, z);
        if (d > r + 0.4) continue;
        if (hollow && d < r - 0.6) continue;
        this.fill(cx + x, y1, cz + z, cx + x, y2, cz + z, block);
      }
    return this;
  }

  /** Cúpula (semiesfera) con base en cy. */
  dome(cx: number, cy: number, cz: number, r: number, block: BlockSpec, hollow = true): this {
    for (let x = -r; x <= r; x++)
      for (let z = -r; z <= r; z++)
        for (let y = 0; y <= r; y++) {
          const d = Math.hypot(x, y, z);
          if (d > r + 0.4) continue;
          if (hollow && d < r - 0.6) continue;
          this.set(cx + x, cy + y, cz + z, block);
        }
    return this;
  }

  /** Cono (tejado de choza): radio r en la base cy, altura h. */
  cone(cx: number, cy: number, cz: number, r: number, h: number, block: BlockSpec): this {
    for (let y = 0; y < h; y++) {
      const rr = r * (1 - y / h);
      for (let x = -Math.ceil(rr); x <= Math.ceil(rr); x++)
        for (let z = -Math.ceil(rr); z <= Math.ceil(rr); z++) {
          const d = Math.hypot(x, z);
          if (d <= rr + 0.4 && d >= rr - 1.2) this.set(cx + x, cy + y, cz + z, block);
        }
    }
    return this;
  }

  /** Cofre con objetos. */
  chest(x: number, y: number, z: number, items: [id: string, amount: number][]): this {
    this.set(x, y, z, "minecraft:chest");
    this.ops.push(() => {
      const inv = this.dim.getBlock(this.abs(x, y, z))?.getComponent("minecraft:inventory");
      for (const [id, n] of items) inv?.container?.addItem(new ItemStack(id, n));
    });
    return this;
  }

  spawn(type: string, x: number, y: number, z: number, name?: string, tag?: string): this {
    this.ops.push(() => {
      const e = this.dim.spawnEntity(type, { x: this.origin.x + x + 0.5, y: this.origin.y + y, z: this.origin.z + z + 0.5 });
      if (name) e.nameTag = name;
      if (tag) e.addTag(tag);
    });
    return this;
  }

  /** Explanada: limpia el aire encima y pone suelo + relleno debajo. */
  clearing(r: number, height: number, floor: BlockSpec, fillBelow: BlockSpec, depth = 4): this {
    this.fill(-r, 0, -r, r, height, r, "minecraft:air");
    this.fill(-r, -depth, -r, r, -2, r, fillBelow);
    this.fill(-r, -1, -r, r, -1, r, floor);
    return this;
  }
}

function runPlan(plan: Plan, onDone: () => void): void {
  function* job() {
    let i = 0;
    for (const op of plan.ops) {
      safe("build-op", op);
      if (++i % 4 === 0) yield;
    }
    onDone();
  }
  system.runJob(job());
}

export interface Scenario {
  /** Identificador del mundo, p. ej. "roma". */
  key: string;
  title: string;
  subtitle: string;
  /** Si este objeto existe, otro pack "manda" en este mundo y no construimos. */
  skipIfItemExists?: string;
  build(plan: Plan): void;
}

function groundOrigin(player: Player): Vector3 {
  const { x, z } = player.location;
  let top = player.dimension.getTopmostBlock({ x, z });
  // Baja a través de árboles, plantas y nieve hasta el suelo de verdad.
  for (let i = 0; i < 24 && top && /leaves|log|wood|vine|snow_layer|grass$|fern|flower|bush/.test(top.typeId); i++) {
    top = top.below();
  }
  const y = top ? top.location.y + 1 : Math.floor(player.location.y);
  return { x: Math.floor(x), y, z: Math.floor(z) };
}

export function buildScenario(sc: Scenario, player: Player): void {
  const origin = groundOrigin(player);
  const plan = new Plan(player.dimension, origin);
  sc.build(plan);
  player.onScreenDisplay.setActionBar("§7Construyendo el mundo… no te muevas");
  runPlan(plan, () => {
    safe("spawnpoint", () => world.setDefaultSpawnLocation({ x: origin.x, y: origin.y + 1, z: origin.z }));
    safe("tp", () => player.teleport({ x: origin.x + 0.5, y: origin.y + 1, z: origin.z + 0.5 }));
    for (const p of world.getAllPlayers()) {
      p.onScreenDisplay.setTitle(sc.title, { subtitle: sc.subtitle, fadeInDuration: 10, stayDuration: 70, fadeOutDuration: 20 });
    }
    console.log(`[Mundos] escenario ${sc.key} construido en ${origin.x} ${origin.y} ${origin.z}`);
  });
}

/** Construye el escenario automáticamente la primera vez y registra /<key>:construir. */
export function registerScenario(sc: Scenario): void {
  const flag = `${sc.key}:construido`;

  world.afterEvents.playerSpawn.subscribe((ev) => {
    if (!ev.initialSpawn || world.getDynamicProperty(flag)) return;
    if (sc.skipIfItemExists && safeHasItemType(sc.skipIfItemExists)) return;
    world.setDynamicProperty(flag, true);
    // Espera a que carguen los chunks alrededor del jugador.
    system.runTimeout(() => safe("auto-build", () => buildScenario(sc, ev.player)), 60);
  });

  system.beforeEvents.startup.subscribe((init) => {
    init.customCommandRegistry.registerCommand(
      {
        name: `${sc.key}:construir`,
        description: `Construye el escenario "${sc.key}" donde estás`,
        permissionLevel: CommandPermissionLevel.GameDirectors,
        cheatsRequired: false,
      },
      (origin) => {
        const src = origin.sourceEntity;
        if (!(src instanceof Player)) return { status: CustomCommandStatus.Failure, message: "Solo jugadores." };
        system.run(() => safe("cmd-build", () => buildScenario(sc, src)));
        return { status: CustomCommandStatus.Success };
      },
    );
  });
}

function safeHasItemType(id: string): boolean {
  try {
    new ItemStack(id, 1);
    return true;
  } catch {
    return false;
  }
}
