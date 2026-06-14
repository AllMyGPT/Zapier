# 🧟 ZOMBIES — Mega Drive Edition (para Mac)

Un homenaje jugable al clásico de **Sega Mega Drive de los años 90**,
*Zombies Ate My Neighbors* (en Europa simplemente **"Zombies"**, 1993).

Vista cenital, estética retro de 16 bits, pistola de agua y la misión de
siempre: **rescatar a tus vecinos antes de que los zombies se los lleven**.

Está hecho como un único archivo HTML5 + Canvas, así que **corre en cualquier
Mac sin instalar nada**: solo se abre en Safari o Chrome.

## ▶️ Cómo jugar en tu Mac

Opción 1 — doble clic (la más fácil):
1. Descarga la carpeta `zombies/`.
2. Haz **doble clic** en `index.html`. Se abrirá en Safari/Chrome y listo.

Opción 2 — desde la Terminal:
```bash
cd zombies
open index.html        # lo abre en tu navegador por defecto en macOS
```

Opción 3 — servidor local (recomendado si el sonido no arranca):
```bash
cd zombies
python3 -m http.server 8000
# luego abre http://localhost:8000 en el navegador
```

## 🎮 Controles

| Acción            | Tecla / ratón                |
|-------------------|------------------------------|
| Mover             | `W A S D` o las flechas      |
| Disparar agua     | `ESPACIO` o clic del ratón   |
| Apuntar           | mover el ratón (al disparar) |
| Pausa             | `P`                          |
| Empezar / reintentar | `ENTER`                   |

## 🎯 Objetivo

- En cada nivel hay varios **vecinos** (figuras de colores). Tócalos para
  ponerlos a salvo: **+100 puntos** cada uno.
- Los **zombies** aparecen por los bordes y persiguen tanto a ti como a los
  vecinos. Los verdes lentos aguantan 2 disparos; los **runners** (verde claro)
  son rápidos pero caen de un disparo.
- Recoge **bidones azules** (+25 de agua/munición) y **corazones** (+1 vida).
- Si un zombie te toca pierdes una vida. Sin vidas → **Game Over**.
- Supera **8 niveles** para salvar el barrio y ganar.

## 🛠️ Detalles técnicos

- Sin dependencias, sin build, sin conexión: HTML + JavaScript + Canvas 2D.
- Sonido retro generado con la Web Audio API (blips estilo 16 bits).
- Mapas generados al azar en cada nivel, con setos y muros.

¡Diviértete salvando el vecindario! 🧟‍♂️💦
