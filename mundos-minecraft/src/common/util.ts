/** Utilidades compartidas por los tres mundos. */
import {
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

export const add = (a: Vector3, b: Vector3): Vector3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
export const scale = (v: Vector3, k: number): Vector3 => ({ x: v.x * k, y: v.y * k, z: v.z * k });
export const center = (v: Vector3): Vector3 => ({ x: v.x + 0.5, y: v.y, z: v.z + 0.5 });

export function safe(label: string, fn: () => void): void {
  try {
    fn();
  } catch (e) {
    console.warn(`[Mundos] ${label}: ${e}`);
  }
}

export function heldTypeIds(player: Player): string[] {
  const equip = player.getComponent("minecraft:equippable");
  if (!equip) return [];
  return [EquipmentSlot.Mainhand, EquipmentSlot.Offhand]
    .map((slot) => equip.getEquipment(slot)?.typeId)
    .filter((id): id is string => id !== undefined);
}

const HOSTILE_FAMILIES = ["monster", "zombie", "skeleton", "undead", "illager"];
export function isHostile(entity: Entity, extraTags: string[] = []): boolean {
  if (extraTags.some((t) => entity.hasTag(t))) return true;
  const family = entity.getComponent("minecraft:type_family");
  return !!family && HOSTILE_FAMILIES.some((f) => family.hasTypeFamily(f));
}

/** Consume 1 unidad del objeto de la mano principal (no en creativo). */
export function consumeMainhand(player: Player, typeId: string): void {
  if (player.getGameMode() === GameMode.Creative) return;
  const equip = player.getComponent("minecraft:equippable");
  const stack = equip?.getEquipment(EquipmentSlot.Mainhand);
  if (!equip || !stack || stack.typeId !== typeId) return;
  if (stack.amount > 1) {
    stack.amount -= 1;
    equip.setEquipment(EquipmentSlot.Mainhand, stack);
  } else {
    equip.setEquipment(EquipmentSlot.Mainhand, undefined);
  }
}

/** Cooldown simple por jugador y clave. */
const cooldowns = new Map<string, number>();
export function onCooldown(player: Player, key: string, ticks: number): boolean {
  const k = `${player.id}:${key}`;
  const now = system.currentTick;
  if ((cooldowns.get(k) ?? 0) > now) return true;
  cooldowns.set(k, now + ticks);
  return false;
}

export interface RayShot {
  range: number;
  damage: number;
  particle: string;
  step?: number;
}

/** Disparo instantáneo por raycast: devuelve la entidad alcanzada (si hay). */
export function rayShot(player: Player, shot: RayShot): Entity | undefined {
  const dim = player.dimension;
  const origin = player.getHeadLocation();
  const dir = player.getViewDirection();
  const blockHit = dim.getBlockFromRay(origin, dir, { maxDistance: shot.range, includePassableBlocks: false });
  const wallDist = blockHit
    ? Math.hypot(
        blockHit.block.location.x + blockHit.faceLocation.x - origin.x,
        blockHit.block.location.y + blockHit.faceLocation.y - origin.y,
        blockHit.block.location.z + blockHit.faceLocation.z - origin.z,
      )
    : shot.range;
  const target = dim
    .getEntitiesFromRay(origin, dir, { maxDistance: wallDist, excludeTypes: ["minecraft:item", "minecraft:xp_orb"] })
    .filter((h) => h.entity.id !== player.id && h.entity.isValid)[0];
  const travel = target ? target.distance : wallDist;
  for (let d = 1; d < travel; d += shot.step ?? 0.75) {
    safe("ray-particle", () => dim.spawnParticle(shot.particle, add(origin, scale(dir, d))));
  }
  if (target) {
    target.entity.applyDamage(shot.damage, { cause: EntityDamageCause.projectile, damagingEntity: player });
    safe("ray-knockback", () => target.entity.applyKnockback({ x: dir.x * 0.6, z: dir.z * 0.6 }, 0.2));
  }
  return target?.entity;
}

/** Oleada de enemigos en círculo alrededor de un punto. */
export interface WaveKind {
  type: string;
  name: string;
  tag: string;
  equipment: [slot: string, item: string][];
}
export function spawnWave(dim: Dimension, at: Vector3, kinds: WaveKind[], count: number, radius = 7): void {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = radius + (i % 2);
    const pos = { x: at.x + Math.cos(angle) * r, y: at.y + 1, z: at.z + Math.sin(angle) * r };
    const kind = kinds[i % kinds.length];
    safe("spawn-wave", () => {
      const e = dim.spawnEntity(kind.type, pos);
      e.nameTag = kind.name;
      e.addTag(kind.tag);
      for (const [slot, item] of kind.equipment) e.runCommand(`replaceitem entity @s ${slot} 0 ${item}`);
      dim.spawnParticle("minecraft:huge_explosion_emitter", pos);
    });
  }
}

/** Suelta monedas al matar hostiles. */
export function rewardOnKill(coin: string, label: string, extraTags: string[]): void {
  world.afterEvents.entityDie.subscribe((ev) => {
    const killer = ev.damageSource.damagingEntity;
    if (!(killer instanceof Player)) return;
    const dead = ev.deadEntity;
    safe("reward", () => {
      if (!isHostile(dead, extraTags)) return;
      const amount = 1 + Math.floor(Math.random() * 3);
      dead.dimension.spawnItem(new ItemStack(coin, amount), dead.location);
      killer.onScreenDisplay.setActionBar(`§e+ ${label}${amount > 1 ? ` x${amount}` : ""}`);
      killer.playSound("random.orb", { pitch: 1.4 });
    });
  });
}
