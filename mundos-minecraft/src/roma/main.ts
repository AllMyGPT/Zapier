/**
 * MUNDO ROMANO — mecánicas (Script API estable @minecraft/server 2.1.0)
 *  1. Formación Testudo   2. Pilum   3. Coliseo   4. Denarios   5. Escenario: Foro + Coliseo
 */
import {
  BlockComponentPlayerInteractEvent,
  CommandPermissionLevel,
  CustomCommandStatus,
  Dimension,
  Player,
  system,
  Vector3,
  world,
} from "@minecraft/server";
import { registerScenario } from "../common/builder.js";
import { center, consumeMainhand, heldTypeIds, onCooldown, rayShot, rewardOnKill, safe, spawnWave, WaveKind } from "../common/util.js";

const GLADIUS = "roma:gladius";
const PILUM = "roma:pilum";
const SHIELD = "minecraft:shield";
const GLADIATOR_TAG = "roma_gladiator";

// ---------------------------------------------------------------- 1. Testudo
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    safe("testudo", () => {
      if (!player.isSneaking) return;
      const held = heldTypeIds(player);
      if (!held.includes(GLADIUS) && !held.includes(SHIELD)) return;
      player.addEffect("resistance", 40, { amplifier: 1, showParticles: false }); // nivel II
      player.addEffect("slowness", 40, { amplifier: 0, showParticles: false }); // nivel I
      player.onScreenDisplay.setActionBar("§e🛡️ Formación Testudo Activa");
    });
  }
}, 20);

// ---------------------------------------------------------------- 2. Pilum
world.afterEvents.itemUse.subscribe((ev) => {
  if (ev.itemStack.typeId !== PILUM) return;
  const player = ev.source;
  safe("pilum", () => {
    if (onCooldown(player, "pilum", 15)) return;
    player.dimension.playSound("item.trident.throw", player.location, { pitch: 0.9 });
    const victim = rayShot(player, { range: 20, damage: 10, particle: "minecraft:basic_crit_particle" });
    if (victim) {
      // Perforación de escudo: inutiliza el escudo de un jugador 5 s.
      if (victim instanceof Player && heldTypeIds(victim).includes(SHIELD)) {
        victim.startItemCooldown("shield", 100);
        victim.onScreenDisplay.setActionBar("§c¡El pilum ha perforado tu escudo!");
      }
      player.dimension.playSound("item.trident.hit", victim.location);
      player.onScreenDisplay.setActionBar("§6¡Impacto de pilum!");
    }
    consumeMainhand(player, PILUM);
  });
});

// ---------------------------------------------------------------- 3. Coliseo
const GLADIATORS: WaveKind[] = [
  {
    type: "minecraft:zombie",
    name: "§cGladiador Murmillo",
    tag: GLADIATOR_TAG,
    equipment: [
      ["slot.armor.head", "iron_helmet"],
      ["slot.armor.chest", "golden_chestplate"],
      ["slot.armor.legs", "iron_leggings"],
      ["slot.weapon.mainhand", "iron_sword"],
    ],
  },
  {
    type: "minecraft:skeleton",
    name: "§6Gladiador Retiarius",
    tag: GLADIATOR_TAG,
    equipment: [
      ["slot.armor.head", "golden_helmet"],
      ["slot.armor.chest", "iron_chestplate"],
      ["slot.weapon.mainhand", "bow"],
    ],
  },
];

const altarCooldown = new Map<string, number>();
function startColosseumWave(dim: Dimension, at: Vector3): void {
  const players = dim.getPlayers({ location: at, maxDistance: 32 });
  const key = `${dim.id}:${Math.floor(at.x)},${Math.floor(at.y)},${Math.floor(at.z)}`;
  const now = system.currentTick;
  const until = altarCooldown.get(key) ?? 0;
  if (until > now) {
    players.forEach((p) => p.onScreenDisplay.setActionBar(`§7La arena se prepara... (${Math.ceil((until - now) / 20)}s)`));
    return;
  }
  altarCooldown.set(key, now + 20 * 30);
  dim.playSound("raid.horn", at, { volume: 4 });
  players.forEach((p) =>
    p.onScreenDisplay.setTitle("§6¡AVE CÉSAR!", { subtitle: "§fOleada del Coliseo iniciada", fadeInDuration: 10, stayDuration: 50, fadeOutDuration: 20 }),
  );
  spawnWave(dim, at, GLADIATORS, 4 + Math.min(players.length, 4) * 2);
}

system.beforeEvents.startup.subscribe((init) => {
  init.blockComponentRegistry.registerCustomComponent("roma:altar", {
    onPlayerInteract(ev: BlockComponentPlayerInteractEvent) {
      safe("altar", () => startColosseumWave(ev.dimension, center(ev.block.location)));
    },
  });
  init.customCommandRegistry.registerCommand(
    {
      name: "roma:coliseo",
      description: "Inicia una oleada de gladiadores del Coliseo a tu alrededor",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
    },
    (origin) => {
      const src = origin.sourceEntity;
      if (!(src instanceof Player)) return { status: CustomCommandStatus.Failure, message: "Solo un jugador puede convocar el Coliseo." };
      system.run(() => safe("coliseo-cmd", () => startColosseumWave(src.dimension, src.location)));
      return { status: CustomCommandStatus.Success };
    },
  );
});

// ---------------------------------------------------------------- 4. Denarios
rewardOnKill("roma:denarius", "Denario Imperial", [GLADIATOR_TAG]);

// ---------------------------------------------------------------- 5. Escenario: Foro Romano
const MARBLE = "roma:marble_pillar";
registerScenario({
  key: "roma",
  title: "§6SPQR",
  subtitle: "§fBienvenido al Foro de Roma",
  skipIfItemExists: "galos:pocion_magica", // en la Aldea Gala manda el pack galo
  build(p) {
    p.clearing(38, 24, "minecraft:grass_block", "minecraft:dirt");
    // Foro: plaza de mármol con columnata
    p.fill(-12, -1, -12, 12, -1, 12, "minecraft:smooth_quartz");
    for (let i = -12; i <= 12; i += 4) {
      for (const [x, z] of [[i, -12], [i, 12], [-12, i], [12, i]] as const) p.fill(x, 0, z, x, 5, z, MARBLE);
    }
    p.fill(-12, 6, -12, 12, 6, -12, "minecraft:smooth_quartz").fill(-12, 6, 12, 12, 6, 12, "minecraft:smooth_quartz");
    p.fill(-12, 6, -12, -12, 6, 12, "minecraft:smooth_quartz").fill(12, 6, -12, 12, 6, 12, "minecraft:smooth_quartz");
    // Templo al norte: escalinata, columnas y frontón
    p.fill(-6, 0, -26, 6, 0, -16, "minecraft:smooth_quartz").fill(-6, 1, -26, 6, 1, -18, "minecraft:smooth_quartz");
    for (let x = -6; x <= 6; x += 3) p.fill(x, 2, -18, x, 8, -18, MARBLE);
    p.fill(-5, 2, -26, 5, 8, -20, "minecraft:quartz_block").fill(-4, 2, -25, 4, 7, -21, "minecraft:air");
    p.fill(-1, 2, -20, 1, 5, -20, "minecraft:air");
    for (let y = 0; y < 4; y++) p.fill(-7 + y * 2, 9 + y, -26, 7 - y * 2, 9 + y, -18, "minecraft:smooth_quartz");
    p.set(0, 2, -24, "minecraft:gold_block").set(0, 3, -24, "minecraft:lantern");
    // Arena del Coliseo al sur con el altar en el centro
    p.cylinder(0, 26, 0, 6, 10, "minecraft:stone_bricks", true);
    p.cylinder(0, 26, 7, 7, 10, "minecraft:polished_andesite", true);
    for (let a = 0; a < 16; a++) {
      const ang = (a / 16) * Math.PI * 2;
      p.fill(Math.round(Math.cos(ang) * 10), 2, 26 + Math.round(Math.sin(ang) * 10), Math.round(Math.cos(ang) * 10), 4, 26 + Math.round(Math.sin(ang) * 10), "minecraft:air");
    }
    p.fill(-1, 0, 15, 1, 3, 17, "minecraft:air");
    p.fill(-8, -1, 18, 8, -1, 34, "minecraft:sand");
    p.set(0, 0, 26, "roma:colosseum_altar");
    // Fuente central, estandartes y botín inicial
    p.fill(-2, 0, -2, 2, 0, 2, "minecraft:polished_andesite").fill(-1, 0, -1, 1, 0, 1, "minecraft:water");
    p.set(0, 1, 0, MARBLE).set(0, 2, 0, "minecraft:gold_block");
    for (const x of [-12, 12]) p.set(x, 7, -12, "minecraft:red_wool").set(x, 7, 12, "minecraft:red_wool");
    p.chest(3, 0, 3, [["roma:gladius", 1], ["roma:pilum", 8], ["roma:denarius", 10], ["minecraft:shield", 1], ["roma:marble_pillar", 64]]);
    // Guardia de legionarios
    for (const [x, z] of [[-4, 10], [4, 10], [-4, -10], [4, -10]] as const) p.spawn("roma:legionary", x, 0, z);
  },
});

console.log("[Mundos] Roma cargada — SPQR");
