# 🧟 ZOMBIES — Mega Drive Edition (para Mac)

Homenaje de **alta fidelidad** al clásico de **Sega Mega Drive de los años 90**
*Zombies Ate My Neighbors* (Konami / LucasArts, 1993; en Europa, **"Zombies"**).

Vista cenital, estética de 16 bits, **mundo con scroll**, pistola de agua y la
misión de siempre: **rescatar a tus vecinos antes de que los monstruos se los
lleven**. Un único archivo HTML5 + Canvas, así que **corre en cualquier Mac sin
instalar nada**: solo se abre en Safari o Chrome.

## ▶️ Cómo jugar en tu Mac

- **Doble clic** en `zombies/index.html` (se abre en tu navegador), o
- Terminal: `cd zombies && open index.html`, o
- Servidor local (si el audio no arranca): `cd zombies && python3 -m http.server 8000` y abre `http://localhost:8000`.

## 🎮 Controles

| Acción              | Tecla / ratón                  |
|---------------------|--------------------------------|
| Mover               | `W A S D` o flechas            |
| Disparar / apuntar  | `ESPACIO`, o clic (apunta con el ratón) |
| Cambiar de arma     | `Q` / `E`, o teclas `1`–`7`    |
| Pausa               | `P`                            |
| Música on/off       | `M`                            |
| Empezar / reintentar| `ENTER`                        |

## 🎯 Objetivo (como en el original)

- En cada nivel hay **hasta 10 vecinos**. Llega a ellos (tócalos) para ponerlos
  a salvo antes de que un monstruo los devore.
- Los **vecinos son tus vidas globales**: empiezas con 10 en total y, si los
  monstruos acaban con todos, es **Game Over**. Además tienes tu **barra de
  salud**; si se vacía, pierdes un vecino y reapareces.
- El nivel termina cuando no quedan vecinos en el mapa (salvados o perdidos).
  Supera los **8 niveles** para salvar el barrio.
- La **brújula** sobre tu personaje apunta al vecino más cercano (roja = ¡en
  peligro!).

## 🔫 Armas auténticas

| Arma | Efecto |
|------|--------|
| 💧 Pistola de agua | Arma inicial, munición infinita. Eficaz contra zombies. |
| 🌿 Cortasetos | Cuerpo a cuerpo; **corta los setos** para abrir paso. |
| 🍅 Tomates | Proyectil; útil a distancia. |
| 🥫 Refrescos | Lata explosiva con **daño en área**. |
| ✝ Crucifijo | **Mata de un golpe** a licántropos y vampiros. |
| 🚀 Bazooka | Gran daño en área; **revienta setos y muros**. |
| ❄ Extintor | **Congela** a los monstruos. |

## 🧪 Ítems y power-ups

- **Botiquín** (salud), **Zapatillas T.K. 3000** (velocidad), **Llave** (abre la
  puerta cerrada), **Caja de Pandora** (dispara energía buscadora a los
  monstruos), **Señuelo payaso** (atrae a los monstruos lejos de ti).
- **Pociones**: *Monstruo* (te conviertes en bestia púrpura invencible que
  embiste muros y enemigos), *Fantasma* (intocable, pero no puedes disparar) y
  *Misteriosa* (efecto aleatorio).
- Cajas de **munición** para cada arma.

## 👹 Monstruos

Zombies, **maníaco de la motosierra** (mucha vida), **licántropo** (rápido),
**vampiro** (se teletransporta), **momia** (resistente), **hormiga gigante**,
**marciano** (te atrapa en una burbuja con su rayo), **muñeco diabólico** y
**baba**. Cada uno aparece a partir de cierto nivel.

## 🏡 Vecinos a rescatar

Sr. Barbacoa, animadora, bebé, profesora, turista, soldado, bañista y perrito —
cada uno con su sprite, y todos huyen presa del pánico cuando un monstruo se
acerca.

## 🛠️ Detalles técnicos

- Sin dependencias, sin build, sin conexión: HTML + JavaScript + Canvas 2D.
- Mundo de 34×26 tiles con **cámara que sigue al jugador**; barrio suburbano
  generado al azar con casas, vallas, setos cortables, piscinas (que frenan) y
  una puerta cerrada con llave.
- Música surf-terror y efectos retro con la Web Audio API.

## 📚 Documentación / fuentes

Las armas, ítems, monstruos, vecinos y mecánicas se basan en el juego original:

- [Zombies Ate My Neighbors — Wikipedia](https://en.wikipedia.org/wiki/Zombies_Ate_My_Neighbors)
- [Manual de instrucciones SNES](http://www.world-of-nintendo.com/manuals/super_nes/zombies_ate_my_neighbors.shtml)
- [Lucasfilm Wiki](https://lucasfilm.fandom.com/wiki/Zombies_Ate_My_Neighbors)
- [Giant Bomb](https://www.giantbomb.com/zombies-ate-my-neighbors/3030-16116/)
- [TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/ZombiesAteMyNeighbors)

¡Diviértete salvando el vecindario! 🧟‍♂️💦
