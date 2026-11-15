/**
 * GALAXIA — mundo de ópera espacial (Script API estable @minecraft/server 2.1.0)
 *  1. Espadas de plasma: daño alto + sonido; agachado + usar => empuje telequinético.
 *  2. Bláster: disparo láser instantáneo (raycast 32 bloques).
 *  3. Baliza de invasión: oleada de soldados y droides del Imperio Galáctico.
 *  4. Créditos galácticos al derrotar enemigos.
 *  5. Escenario: puesto avanzado en el desierto con nave de desembarco.
 */
import {
  BlockComponentPlayerInteractEvent,
  CommandPermissionLevel,
  CustomCommandStatus,
  Dimension,
  EquipmentSlot,
  Player,
  system,
  Vector3,
  world,
} from "@minecraft/server";
import { registerScenario } from "../common/builder.js";
import { center, onCooldown, rayShot, rewardOnKill, safe, spawnWave, WaveKind } from "../common/util.js";

const SABERS = ["galaxia:espada_plasma_azul", "galaxia:espada_plasma_verde", "galaxia:espada_plasma_roja"];
const BLASTER = "galaxia:blaster";
const ENEMY_TAG = "galaxia_imperio";

// ---------------------------------------------------------------- 1. Espadas de plasma
world.afterEvents.entityHitEntity.subscribe((ev) => {
  const a = ev.damagingEntity;
  if (!(a instanceof Player)) return;
  const held = a.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand)?.typeId;
  if (held && SABERS.includes(held)) safe("saber-hit", () => a.dimension.playSound("mob.blaze.hit", ev.hitEntity.location, { pitch: 1.6, volume: 0.7 }));
});

world.afterEvents.itemUse.subscribe((ev) => {
  const player = ev.source;
  const id = ev.itemStack.typeId;
  if (SABERS.includes(id)) {
    safe("saber-use", () => {
      if (!player.isSneaking) {
        player.dimension.playSound("beacon.ambient", player.location, { pitch: 1.8 });
        return;
      }
      if (onCooldown(player, "empuje", 60)) return;
      // Empuje telequinético: todo lo que haya delante (cono de 10 bloques) sale despedido.
      const dir = player.getViewDirection();
      const pos = player.location;
      const near = player.dimension.getEntities({ location: pos, maxDistance: 10, excludeTypes: ["minecraft:item", "minecraft:player"] });
      let n = 0;
      for (const e of near) {
        const v = { x: e.location.x - pos.x, z: e.location.z - pos.z };
        const len = Math.hypot(v.x, v.z) || 1;
        if ((v.x * dir.x + v.z * dir.z) / len < 0.5) continue;
        e.applyKnockback({ x: (v.x / len) * 3, z: (v.z / len) * 3 }, 0.7);
        n++;
      }
      player.dimension.spawnParticle("minecraft:sonic_explosion", { x: pos.x + dir.x * 2, y: pos.y + 1, z: pos.z + dir.z * 2 });
      player.dimension.playSound("mob.warden.sonic_boom", pos, { volume: 0.5, pitch: 1.5 });
      player.onScreenDisplay.setActionBar(`§bEmpuje telequinético${n ? ` (${n})` : ""}`);
    });
  } else if (id === BLASTER) {
    safe("blaster", () => {
      if (onCooldown(player, "blaster", 6)) return;
      player.dimension.playSound("mob.shulker.shoot", player.location, { pitch: 1.8 });
      const hit = rayShot(player, { range: 32, damage: 6, particle: "minecraft:redstone_wire_dust_particle", step: 0.5 });
      if (hit) player.dimension.playSound("random.fizz", hit.location, { pitch: 1.5 });
    });
  }
});

// ---------------------------------------------------------------- 3. Invasión
const INVADERS: WaveKind[] = [
  {
    type: "minecraft:skeleton",
    name: "§fSoldado Imperial",
    tag: ENEMY_TAG,
    equipment: [
      ["slot.armor.head", "iron_helmet"],
      ["slot.armor.chest", "iron_chestplate"],
      ["slot.armor.legs", "iron_leggings"],
      ["slot.armor.feet", "iron_boots"],
    ],
  },
  {
    type: "minecraft:zombie",
    name: "§7Droide de Combate",
    tag: ENEMY_TAG,
    equipment: [
      ["slot.armor.head", "chainmail_helmet"],
      ["slot.armor.chest", "chainmail_chestplate"],
      ["slot.weapon.mainhand", "iron_sword"],
    ],
  },
];

const beaconCd = new Map<string, number>();
function invasion(dim: Dimension, at: Vector3): void {
  const players = dim.getPlayers({ location: at, maxDistance: 40 });
  const key = `${Math.floor(at.x)},${Math.floor(at.y)},${Math.floor(at.z)}`;
  const until = beaconCd.get(key) ?? 0;
  if (until > system.currentTick) {
    players.forEach((p) => p.onScreenDisplay.setActionBar(`§7Recargando la baliza… (${Math.ceil((until - system.currentTick) / 20)}s)`));
    return;
  }
  beaconCd.set(key, system.currentTick + 20 * 30);
  dim.playSound("mob.wither.spawn", at, { volume: 1, pitch: 1.4 });
  players.forEach((p) =>
    p.onScreenDisplay.setTitle("§c¡INVASIÓN!", { subtitle: "§fLas tropas imperiales desembarcan", fadeInDuration: 5, stayDuration: 50, fadeOutDuration: 15 }),
  );
  spawnWave(dim, at, INVADERS, 4 + Math.min(players.length, 4) * 2, 9);
}

system.beforeEvents.startup.subscribe((init) => {
  init.blockComponentRegistry.registerCustomComponent("galaxia:baliza", {
    onPlayerInteract(ev: BlockComponentPlayerInteractEvent) {
      safe("baliza", () => invasion(ev.dimension, center(ev.block.location)));
    },
  });
  init.customCommandRegistry.registerCommand(
    { name: "galaxia:invasion", description: "Desembarco de tropas imperiales a tu alrededor", permissionLevel: CommandPermissionLevel.Any, cheatsRequired: false },
    (origin) => {
      const src = origin.sourceEntity;
      if (!(src instanceof Player)) return { status: CustomCommandStatus.Failure, message: "Solo jugadores." };
      system.run(() => safe("invasion-cmd", () => invasion(src.dimension, src.location)));
      return { status: CustomCommandStatus.Success };
    },
  );
});

// ---------------------------------------------------------------- 4. Créditos
rewardOnKill("galaxia:credito", "Crédito galáctico", [ENEMY_TAG]);

// ---------------------------------------------------------------- 5. Escenario: puesto avanzado
registerScenario({
  key: "galaxia",
  title: "§bPUESTO AVANZADO",
  subtitle: "§fHace mucho tiempo, en un planeta desértico…",
  build(p) {
    p.clearing(36, 22, "minecraft:sand", "minecraft:sandstone");
    // Cúpulas habitables
    const domes: [number, number, number][] = [[-14, -10, 5], [12, -12, 6], [-12, 12, 4], [0, -24, 4]];
    for (const [x, z, r] of domes) {
      p.dome(x, 0, z, r, "minecraft:white_concrete");
      p.cylinder(x, z, -1, -1, r, "minecraft:smooth_sandstone");
      p.fill(x, 0, z + r, x, 1, z + r, "minecraft:air");
      p.set(x, r - 1, z, "minecraft:sea_lantern");
    }
    // Vaporizadores de humedad
    for (const [x, z] of [[-24, 0], [22, 6], [-4, 26], [26, -22]] as const) {
      p.fill(x, 0, z, x, 4, z, "minecraft:iron_bars").set(x, 5, z, "minecraft:end_rod");
      p.set(x + 1, 1, z, "minecraft:iron_trapdoor").set(x - 1, 1, z, "minecraft:iron_trapdoor");
    }
    // Plataforma de aterrizaje + nave de desembarco
    p.cylinder(18, 16, -1, -1, 9, "minecraft:gray_concrete").cylinder(18, 16, -1, -1, 9, "minecraft:yellow_concrete", true);
    p.fill(14, 1, 15, 22, 3, 17, "minecraft:light_gray_concrete"); // fuselaje
    p.fill(23, 2, 15, 24, 3, 17, "minecraft:light_gray_concrete").fill(25, 2, 16, 25, 3, 16, "minecraft:light_blue_stained_glass"); // cabina
    p.fill(15, 2, 11, 20, 2, 14, "minecraft:gray_concrete").fill(15, 2, 18, 20, 2, 21, "minecraft:gray_concrete"); // alas
    p.fill(13, 1, 15, 13, 3, 17, "minecraft:orange_stained_glass"); // motores
    p.fill(16, 0, 15, 16, 0, 17, "minecraft:iron_block").fill(21, 0, 15, 21, 0, 17, "minecraft:iron_block"); // patas
    // Cantina y mercado
    p.fill(-6, 0, 18, 6, 4, 28, "minecraft:smooth_sandstone").fill(-5, 0, 19, 5, 3, 27, "minecraft:air");
    p.fill(-1, 0, 18, 1, 2, 18, "minecraft:air").fill(-6, 5, 18, 6, 5, 28, "minecraft:cut_sandstone");
    p.set(0, 0, 25, "minecraft:crafting_table").set(-4, 0, 26, "minecraft:barrel").set(4, 0, 26, "minecraft:barrel");
    // Baliza de invasión en la plaza central y equipo inicial
    p.fill(-2, -1, -2, 2, -1, 2, "minecraft:polished_blackstone");
    p.set(0, 0, 0, "galaxia:baliza");
    p.chest(3, 0, 0, [
      ["galaxia:espada_plasma_azul", 1],
      ["galaxia:espada_plasma_verde", 1],
      ["galaxia:blaster", 1],
      ["galaxia:credito", 20],
      ["minecraft:iron_chestplate", 1],
    ]);
  },
});

console.log("[Mundos] Galaxia cargada");
