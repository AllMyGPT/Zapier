/**
 * ALDEA GALA — mecánicas (Script API estable @minecraft/server 2.1.0)
 *  1. Poción mágica: fuerza sobrehumana 60 s; tus golpes mandan a volar a los enemigos.
 *  2. Menhir: con la poción activa puedes lanzarlo (raycast con gran empuje).
 *  3. Jabalíes y banquete: al comer jabalí asado recuperas vida extra.
 *  4. Escenario: aldea fortificada + campamento romano vecino.
 */
import { CommandPermissionLevel, CustomCommandStatus, EntityDamageCause, Player, system, world } from "@minecraft/server";
import { Plan, registerScenario } from "../common/builder.js";
import { consumeMainhand, onCooldown, rayShot, rewardOnKill, safe } from "../common/util.js";

const POCION = "galos:pocion_magica";
const MENHIR = "galos:menhir";
const POCION_TICKS = 20 * 60;
const potionUntil = (p: Player) => (p.getDynamicProperty("galos:pocion_hasta") as number | undefined) ?? 0;
const hasPotion = (p: Player) => potionUntil(p) > system.currentTick;

// ---------------------------------------------------------------- 1. Poción mágica
world.afterEvents.itemCompleteUse.subscribe((ev) => {
  const player = ev.source;
  safe("pocion", () => {
    if (ev.itemStack.typeId === POCION) {
      player.setDynamicProperty("galos:pocion_hasta", system.currentTick + POCION_TICKS);
      player.addEffect("strength", POCION_TICKS, { amplifier: 3 });
      player.addEffect("speed", POCION_TICKS, { amplifier: 1 });
      player.addEffect("jump_boost", POCION_TICKS, { amplifier: 1 });
      player.addEffect("resistance", POCION_TICKS, { amplifier: 1 });
      player.onScreenDisplay.setTitle("§a¡POR TUTATIS!", { subtitle: "§fLa poción mágica hace efecto", fadeInDuration: 5, stayDuration: 40, fadeOutDuration: 10 });
      player.dimension.playSound("random.levelup", player.location);
    } else if (ev.itemStack.typeId === "galos:jabali_asado") {
      player.addEffect("regeneration", 200, { amplifier: 1 });
      player.addEffect("absorption", 1200, { amplifier: 1 });
      player.onScreenDisplay.setActionBar("§6¡Banquete galo!");
    }
  });
});

// Golpes con la poción: lanzan al enemigo por los aires.
world.afterEvents.entityHitEntity.subscribe((ev) => {
  const attacker = ev.damagingEntity;
  if (!(attacker instanceof Player) || !hasPotion(attacker)) return;
  const target = ev.hitEntity;
  safe("golpe-galo", () => {
    const dir = attacker.getViewDirection();
    target.applyKnockback({ x: dir.x * 4, z: dir.z * 4 }, 1.2);
    attacker.dimension.spawnParticle("minecraft:knockback_roar_particle", target.location);
  });
});

// Aviso del fin de la poción.
system.runInterval(() => {
  for (const p of world.getAllPlayers()) {
    const left = potionUntil(p) - system.currentTick;
    if (left > 0 && left <= 200) p.onScreenDisplay.setActionBar(`§aPoción mágica: ${Math.ceil(left / 20)} s`);
  }
}, 20);

// ---------------------------------------------------------------- 2. Lanzar menhir
world.afterEvents.itemUse.subscribe((ev) => {
  const player = ev.source;
  if (ev.itemStack.typeId !== MENHIR || !player.isSneaking) return;
  safe("menhir", () => {
    if (!hasPotion(player)) {
      player.onScreenDisplay.setActionBar("§7Pesa demasiado… necesitas la poción mágica");
      return;
    }
    if (onCooldown(player, "menhir", 30)) return;
    player.dimension.playSound("random.explode", player.location, { volume: 0.6, pitch: 0.6 });
    const hit = rayShot(player, { range: 24, damage: 16, particle: "minecraft:large_explosion", step: 1.5 });
    if (hit) {
      const dir = player.getViewDirection();
      safe("menhir-kb", () => hit.applyKnockback({ x: dir.x * 3, z: dir.z * 3 }, 1));
      player.onScreenDisplay.setActionBar("§a¡Menhir de entrega inmediata!");
    }
    consumeMainhand(player, MENHIR);
  });
});

// ---------------------------------------------------------------- 3. Recompensas
// Los legionarios del campamento no son hostiles, pero los "romanos invasores" sí.
rewardOnKill("roma:denarius", "Sestercio romano", ["galos_romano"]);

// Los jabalíes no atacan, pero con la poción caen de un golpe.
world.afterEvents.entityHurt.subscribe((ev) => {
  const src = ev.damageSource;
  if (ev.hurtEntity.typeId !== "galos:jabali" || !(src.damagingEntity instanceof Player)) return;
  if (hasPotion(src.damagingEntity)) safe("jabali", () => ev.hurtEntity.applyDamage(100, { cause: EntityDamageCause.entityAttack }));
});

// Comando: oleada de romanos invasores contra la aldea.
system.beforeEvents.startup.subscribe((init) => {
  init.customCommandRegistry.registerCommand(
    { name: "galos:romanos", description: "Una patrulla romana ataca la aldea", permissionLevel: CommandPermissionLevel.Any, cheatsRequired: false },
    (origin) => {
      const src = origin.sourceEntity;
      if (!(src instanceof Player)) return { status: CustomCommandStatus.Failure, message: "Solo jugadores." };
      system.run(() =>
        safe("romanos", () => {
          src.onScreenDisplay.setTitle("§c¡ROMANOS!", { subtitle: "§fEstán locos estos romanos", fadeInDuration: 5, stayDuration: 40, fadeOutDuration: 10 });
          src.dimension.playSound("raid.horn", src.location, { volume: 3 });
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            const e = src.dimension.spawnEntity("minecraft:zombie", { x: src.location.x + Math.cos(a) * 9, y: src.location.y + 1, z: src.location.z + Math.sin(a) * 9 });
            e.nameTag = "§cLegionario invasor";
            e.addTag("galos_romano");
            e.runCommand("replaceitem entity @s slot.armor.head 0 iron_helmet");
            e.runCommand("replaceitem entity @s slot.armor.chest 0 iron_chestplate");
            e.runCommand("replaceitem entity @s slot.weapon.mainhand 0 roma:gladius");
          }
        }),
      );
      return { status: CustomCommandStatus.Success };
    },
  );
});

// ---------------------------------------------------------------- 4. Escenario: la aldea
function hut(p: Plan, x: number, z: number, r = 3): void {
  p.cylinder(x, z, 0, 3, r, "minecraft:stripped_spruce_log", true);
  p.cylinder(x, z, -1, -1, r, "minecraft:spruce_planks");
  p.cone(x, 4, z, r + 1, r + 3, "minecraft:hay_block");
  p.set(x, 4, z, "minecraft:hay_block");
  p.fill(x, 0, z + r, x, 1, z + r, "minecraft:air"); // puerta orientada al sur
  p.set(x, 0, z, "minecraft:campfire");
}

registerScenario({
  key: "galos",
  title: "§aALDEA GALA",
  subtitle: "§fLa aldea que resiste al invasor",
  build(p) {
    p.clearing(40, 20, "minecraft:grass_block", "minecraft:dirt");
    // Empalizada circular con puerta
    p.cylinder(0, 0, 0, 4, 20, "minecraft:spruce_log", true);
    for (let a = 0; a < 40; a++) {
      const ang = (a / 40) * Math.PI * 2;
      if (a % 2 === 0) p.set(Math.round(Math.cos(ang) * 20), 5, Math.round(Math.sin(ang) * 20), "minecraft:spruce_fence");
    }
    p.fill(-2, 0, 18, 2, 3, 22, "minecraft:air");
    p.fill(-2, -1, 18, 2, -1, 22, "minecraft:dirt_path");
    // Chozas
    for (const [x, z] of [[-10, -8], [10, -8], [-12, 6], [12, 6], [0, -14]] as const) hut(p, x, z);
    hut(p, 0, 9, 4); // gran choza del jefe
    // Caldero del druida en la plaza
    p.fill(-3, -1, -3, 3, -1, 3, "minecraft:cobblestone");
    p.set(0, 0, 0, "minecraft:cauldron").set(1, 0, 0, "minecraft:campfire").set(-1, 0, 0, "minecraft:campfire");
    p.chest(2, 0, 2, [["galos:pocion_magica", 6], ["galos:hoz_de_oro", 1], ["galos:menhir", 4], ["galos:jabali_asado", 16]]);
    // Taller del picapedrero: menhires
    for (const [x, z] of [[14, -14], [16, -12], [12, -16]] as const) p.fill(x, 0, z, x, 3, z, MENHIR);
    // Mesa del banquete
    p.fill(-6, 0, 14, 6, 0, 14, "minecraft:oak_planks").fill(-6, 0, 13, 6, 0, 13, "minecraft:oak_stairs");
    // Bosque de jabalíes fuera de la empalizada
    for (const [x, z] of [[-28, 0], [-26, 8], [-30, -6], [26, -24], [-24, 24]] as const) p.spawn("galos:jabali", x, 0, z);
    for (const [x, z] of [[-32, 4], [-29, -12], [-34, -2]] as const) p.fill(x, 0, z, x, 5, z, "minecraft:oak_log").cylinder(x, z, 5, 7, 2, "minecraft:oak_leaves");
    // Campamento romano vecino al este
    p.fill(28, -1, -8, 38, -1, 8, "minecraft:coarse_dirt");
    p.fill(28, 0, -8, 38, 2, -8, "minecraft:stripped_oak_log").fill(28, 0, 8, 38, 2, 8, "minecraft:stripped_oak_log");
    p.fill(38, 0, -8, 38, 2, 8, "minecraft:stripped_oak_log").fill(28, 0, -8, 28, 2, 8, "minecraft:stripped_oak_log");
    p.fill(28, 0, -1, 28, 2, 1, "minecraft:air");
    for (const z of [-5, 0, 5]) p.fill(32, 0, z - 1, 35, 1, z + 1, "minecraft:red_wool").fill(33, 2, z - 1, 34, 2, z + 1, "minecraft:red_wool");
    p.set(30, 0, -6, "roma:colosseum_altar");
    for (const [x, z] of [[30, -3], [30, 3], [36, -6]] as const) p.spawn("roma:legionary", x, 0, z);
  },
});

console.log("[Mundos] Aldea gala cargada — ¡Por Tutatis!");
