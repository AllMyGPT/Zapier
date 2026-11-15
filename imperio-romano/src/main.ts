/**
 * Imperio Romano — mecánicas de juego (Script API estable @minecraft/server 2.1.0)
 *
 *  1. Formación Testudo: agachado + gladius/escudo => resistencia + lentitud.
 *  2. Pilum: al usarlo se lanza en la dirección de la vista (raycast 20 bloques).
 *  3. Coliseo: el altar (o /roma:coliseo) invoca una oleada de gladiadores.
 *  4. Denarios: matar hostiles/gladiadores suelta 1-3 roma:denarius.
 */
import {
  BlockComponentPlayerInteractEvent,
  CommandPermissionLevel,
  CustomCommandStatus,
  Dimension,
  Entity,
  EntityDamageCause,
  EquipmentSlot,
  GameMode,
  ItemStack,
  Player,
  system,
  Vector3,
  world,
} from "@minecraft/server";

// ---------------------------------------------------------------- constantes
const GLADIUS = "roma:gladius";
const PILUM = "roma:pilum";
const DENARIUS = "roma:denarius";
const SHIELD = "minecraft:shield";

const GLADIATOR_TAG = "roma_gladiator";
const TESTUDO_INTERVAL = 20; // ticks (1 s)
const PILUM_RANGE = 20; // bloques
const PILUM_DAMAGE = 10;
const PILUM_COOLDOWN_TICKS = 15;
const ALTAR_COOLDOWN_TICKS = 20 * 30; // 30 s entre oleadas por altar
const HOSTILE_FAMILIES = ["monster", "zombie", "skeleton", "undead", "illager"];

// ---------------------------------------------------------------- utilidades
const add = (a: Vector3, b: Vector3): Vector3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const scale = (v: Vector3, k: number): Vector3 => ({ x: v.x * k, y: v.y * k, z: v.z * k });
const center = (v: Vector3): Vector3 => ({ x: v.x + 0.5, y: v.y, z: v.z + 0.5 });

function heldTypeIds(player: Player): string[] {
  const equip = player.getComponent("minecraft:equippable");
  if (!equip) return [];
  return [EquipmentSlot.Mainhand, EquipmentSlot.Offhand]
    .map((slot) => equip.getEquipment(slot)?.typeId)
    .filter((id): id is string => id !== undefined);
}

function isHostile(entity: Entity): boolean {
  if (entity.hasTag(GLADIATOR_TAG)) return true;
  const family = entity.getComponent("minecraft:type_family");
  return !!family && HOSTILE_FAMILIES.some((f) => family.hasTypeFamily(f));
}

function safe(label: string, fn: () => void): void {
  try {
    fn();
  } catch (e) {
    console.warn(`[ImperioRomano] ${label}: ${e}`);
  }
}

// ---------------------------------------------------------------- 1. Testudo
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    safe("testudo", () => {
      if (!player.isSneaking) return;
      const held = heldTypeIds(player);
      if (!held.includes(GLADIUS) && !held.includes(SHIELD)) return;
      // amplifier 0 = nivel I, 1 = nivel II
      player.addEffect("resistance", 40, { amplifier: 1, showParticles: false });
      player.addEffect("slowness", 40, { amplifier: 0, showParticles: false });
      player.onScreenDisplay.setActionBar("§e🛡️ Formación Testudo Activa");
    });
  }
}, TESTUDO_INTERVAL);

// ---------------------------------------------------------------- 2. Pilum
const pilumCooldown = new Map<string, number>();

function consumeHeldPilum(player: Player): void {
  if (player.getGameMode() === GameMode.Creative) return;
  const equip = player.getComponent("minecraft:equippable");
  const stack = equip?.getEquipment(EquipmentSlot.Mainhand);
  if (!equip || !stack || stack.typeId !== PILUM) return;
  if (stack.amount > 1) {
    stack.amount -= 1;
    equip.setEquipment(EquipmentSlot.Mainhand, stack);
  } else {
    equip.setEquipment(EquipmentSlot.Mainhand, undefined);
  }
}

function throwPilum(player: Player): void {
  const now = system.currentTick;
  if ((pilumCooldown.get(player.id) ?? 0) > now) return;
  pilumCooldown.set(player.id, now + PILUM_COOLDOWN_TICKS);

  const dim = player.dimension;
  const origin = player.getHeadLocation();
  const dir = player.getViewDirection();

  // Distancia hasta el primer bloque sólido para no atravesar paredes.
  const blockHit = dim.getBlockFromRay(origin, dir, { maxDistance: PILUM_RANGE, includePassableBlocks: false });
  const wallDist = blockHit
    ? Math.hypot(
        blockHit.block.location.x + blockHit.faceLocation.x - origin.x,
        blockHit.block.location.y + blockHit.faceLocation.y - origin.y,
        blockHit.block.location.z + blockHit.faceLocation.z - origin.z,
      )
    : PILUM_RANGE;

  const hits = dim
    .getEntitiesFromRay(origin, dir, { maxDistance: wallDist, excludeTypes: ["minecraft:item", "minecraft:xp_orb"] })
    .filter((h) => h.entity.id !== player.id && h.entity.isValid);
  const target = hits[0];
  const travel = target ? target.distance : wallDist;

  // Estela visual de la jabalina.
  for (let d = 1; d < travel; d += 0.75) {
    safe("pilum-particle", () => dim.spawnParticle("minecraft:basic_crit_particle", add(origin, scale(dir, d))));
  }
  dim.playSound("item.trident.throw", player.location, { volume: 1, pitch: 0.9 });

  if (target) {
    const victim = target.entity;
    // "Perforación de escudo": daño de proyectil + empuje y, si es jugador, deshabilita el escudo.
    victim.applyDamage(PILUM_DAMAGE, { cause: EntityDamageCause.projectile, damagingEntity: player });
    safe("pilum-knockback", () => victim.applyKnockback({ x: dir.x * 0.8, z: dir.z * 0.8 }, 0.25));
    if (victim instanceof Player && heldTypeIds(victim).includes(SHIELD)) {
      victim.startItemCooldown("shield", 100);
      victim.onScreenDisplay.setActionBar("§c¡El pilum ha perforado tu escudo!");
    }
    dim.playSound("item.trident.hit", victim.location);
    player.onScreenDisplay.setActionBar("§6¡Impacto de pilum!");
  } else if (blockHit) {
    dim.playSound("item.trident.hit_ground", add(origin, scale(dir, travel)));
  }

  consumeHeldPilum(player);
}

world.afterEvents.itemUse.subscribe((ev) => {
  if (ev.itemStack.typeId !== PILUM) return;
  safe("pilum", () => throwPilum(ev.source));
});

// ---------------------------------------------------------------- 3. Coliseo
const altarCooldown = new Map<string, number>();

interface GladiatorKind {
  type: string;
  name: string;
  equipment: [slot: string, item: string][];
}

const GLADIATORS: GladiatorKind[] = [
  {
    type: "minecraft:zombie",
    name: "§cGladiador Murmillo",
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
    equipment: [
      ["slot.armor.head", "golden_helmet"],
      ["slot.armor.chest", "iron_chestplate"],
      ["slot.weapon.mainhand", "bow"],
    ],
  },
];

function startColosseumWave(dim: Dimension, at: Vector3, players: Player[]): void {
  const key = `${dim.id}:${Math.floor(at.x)},${Math.floor(at.y)},${Math.floor(at.z)}`;
  const now = system.currentTick;
  if ((altarCooldown.get(key) ?? 0) > now) {
    const secs = Math.ceil(((altarCooldown.get(key) ?? 0) - now) / 20);
    players.forEach((p) => p.onScreenDisplay.setActionBar(`§7La arena se prepara... (${secs}s)`));
    return;
  }
  altarCooldown.set(key, now + ALTAR_COOLDOWN_TICKS);

  dim.playSound("raid.horn", at, { volume: 4 });
  for (const p of players) {
    p.onScreenDisplay.setTitle("§6¡AVE CÉSAR!", {
      subtitle: "§fOleada del Coliseo iniciada",
      fadeInDuration: 10,
      stayDuration: 50,
      fadeOutDuration: 20,
    });
  }

  const count = 4 + Math.min(players.length, 4) * 2; // escala con jugadores
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 6 + (i % 2);
    const pos = { x: at.x + Math.cos(angle) * radius, y: at.y + 1, z: at.z + Math.sin(angle) * radius };
    const kind = GLADIATORS[i % GLADIATORS.length];
    safe("spawn-gladiator", () => {
      const g = dim.spawnEntity(kind.type, pos);
      g.nameTag = kind.name;
      g.addTag(GLADIATOR_TAG);
      for (const [slot, item] of kind.equipment) g.runCommand(`replaceitem entity @s ${slot} 0 ${item}`);
      dim.spawnParticle("minecraft:huge_explosion_emitter", pos);
    });
  }
}

function playersNear(dim: Dimension, at: Vector3, radius = 32): Player[] {
  return dim.getPlayers({ location: at, maxDistance: radius });
}

// Componente personalizado del bloque (vía principal).
system.beforeEvents.startup.subscribe((init) => {
  init.blockComponentRegistry.registerCustomComponent("roma:altar", {
    onPlayerInteract(ev: BlockComponentPlayerInteractEvent) {
      safe("altar", () => startColosseumWave(ev.dimension, center(ev.block.location), playersNear(ev.dimension, ev.block.location)));
    },
  });

  // Comando rápido: /roma:coliseo  (también accesible como /coliseo)
  init.customCommandRegistry.registerCommand(
    {
      name: "roma:coliseo",
      description: "Inicia una oleada de gladiadores del Coliseo a tu alrededor",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
    },
    (origin) => {
      const src = origin.sourceEntity;
      if (!(src instanceof Player)) {
        return { status: CustomCommandStatus.Failure, message: "Solo un jugador puede convocar el Coliseo." };
      }
      // Los callbacks de comandos corren en modo de solo lectura: diferimos al siguiente tick.
      system.run(() => safe("coliseo-cmd", () => startColosseumWave(src.dimension, src.location, playersNear(src.dimension, src.location))));
      return { status: CustomCommandStatus.Success };
    },
  );
});

// ---------------------------------------------------------------- 4. Denarios
world.afterEvents.entityDie.subscribe((ev) => {
  const killer = ev.damageSource.damagingEntity;
  if (!(killer instanceof Player)) return;
  const dead = ev.deadEntity;
  safe("denarius", () => {
    if (!isHostile(dead)) return;
    const amount = 1 + Math.floor(Math.random() * 3); // 1..3
    dead.dimension.spawnItem(new ItemStack(DENARIUS, amount), dead.location);
    killer.onScreenDisplay.setActionBar(`§e+ Denario Imperial${amount > 1 ? ` x${amount}` : ""}`);
    killer.playSound("random.orb", { pitch: 1.4 });
  });
});

// Limpieza de cooldowns al salir.
world.afterEvents.playerLeave.subscribe((ev) => pilumCooldown.delete(ev.playerId));

console.log("[ImperioRomano] SPQR — mod cargado");
