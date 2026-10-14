// ============================================================================
//  MISIONES — Sistema de Pedidos y Clientes · Informática III (Grupo 1301)
// ============================================================================
//  Este es el ÚNICO archivo de lógica que vas a modificar.
//
//  Cada función está "vacía" a propósito. Tu sitio publicado en Vercel tiene un
//  panel de verificación que corre casos de prueba contra estas funciones y te
//  dice cuál falla, qué esperaba y qué obtuvo. Lee el caso que falla ANTES de
//  cambiar código: así se trabaja con pruebas unitarias (lo verás en 3.4).
//
//  Puedes verificar sin publicar con:  npm run verificar
//
//  Orden recomendado: 1 → 2 → 3 → 4 → 5. La 6 es para Destacado.
// ============================================================================

import { ESTADOS } from './datos.js'

// ----------------------------------------------------------------------------
// MISIÓN 1 · RF3 — ¿Cuánto paga el cliente?
// ----------------------------------------------------------------------------
// Recibe un pedido: { items: [{ cantidad, precioUnitario }], descuento }
//   - subtotal = suma de (cantidad × precioUnitario) de cada item
//   - descuento es una fracción (0.1 = 10 %). Si no viene, es 0.
//   - total = subtotal × (1 − descuento), REDONDEADO a 2 decimales.
//   - Un pedido sin items cuesta 0.
// Pista: prueba en la consola 0.1 + 0.2 y verás por qué hay que redondear.
//        Math.round(x * 100) / 100
export function totalPedido(pedido)
 {if (!pedido || !pedido.items || pedido.items.length === 0) {
    return 0;
  }
  const subtotal = pedido.items.reduce((acumulado, item) => {
    return acumulado + (item.cantidad * item.precioUnitario);
  }, 0);

  // Obtenemos el descuento (si no viene o es undefined, por defecto es 0)
  const descuento = pedido.descuento ?? 0;

  // Calculamos el total aplicando el descuento
  const totalSinRedondear = subtotal * (1 - descuento);

  // Redondeamos a 2 decimales usando la pista proporcionada
  return Math.round(totalSinRedondear * 100) / 100;
  return 0 // TODO
}
// ----------------------------------------------------------------------------
// MISIÓN 2 · RF4 — ¿Este cambio de estado es válido?
// ----------------------------------------------------------------------------
// Los estados avanzan en orden y SOLO un paso a la vez:
//   registrado → en_preparacion → listo → entregado
// Devuelve true únicamente si `nuevo` es el estado inmediatamente siguiente
// de `actual`. Saltar pasos, regresar o moverse desde "entregado" es false.
// Un estado que no existe también es false.
// Pista: ESTADOS ya es un arreglo ordenado. ¿Qué te dice indexOf?
export function puedeTransicionar(estadoActual, estadoNuevo) {
  const transiciones = {
    "registrado": ["en preparación", "cancelado"],
    "en preparación": ["listo", "cancelado"],
    "listo": ["entregado"],
    "entregado": [],
    "cancelado": []
  };
  if (!transiciones[estadoActual]) return false;
  return transiciones[estadoActual].includes(estadoNuevo);
}
// ----------------------------------------------------------------------------
// MISIÓN 3 · RF1 — ¿Los datos del cliente son válidos?
// ----------------------------------------------------------------------------
// Recibe { nombre, telefono, email } y devuelve un ARREGLO con los códigos de
// error que apliquen, en este orden. Si todo está bien, devuelve [].
//   'nombre_requerido'  → nombre vacío o solo espacios
//   'telefono_invalido' → después de quitar espacios y guiones, no son
//                         exactamente 10 dígitos
//   'email_invalido'    → el email VIENE (no está vacío) y no tiene forma de
//                         correo: algo@algo.algo   (el email es opcional)
// Pista: '55 1234-5678'.replace(/[\s-]/g, '')   y   /^\d{10}$/.test(...)
export function validarCliente(cliente) {
  let errores = [];

  // 1. Validar nombre: requerido, no vacío y no solo espacios
  if (!cliente || !cliente.nombre || cliente.nombre.trim() === "") {
    errores.push("nombre_requerido");
  }

  // 2. Validar teléfono: opcional, pero si viene debe tener entre 8 y 15 dígitos (o según el formato requerido)
  if (cliente && cliente.telefono !== undefined && cliente.telefono !== null && cliente.telefono !== "") {
    // Limpiamos espacios o guiones si los hubiera para contar los dígitos
    const telLimpio = String(cliente.telefono).replace(/[\s-]/g, "");
    if (!/^\d{8,15}$/.test(telLimpio)) {
      errores.push("telefono_invalido");
    }
  }

  // 3. Validar email: si viene, debe tener un formato válido con @ y punto
  if (cliente && cliente.email !== undefined && cliente.email !== null && cliente.email !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cliente.email)) {
      errores.push("email_invalido");
    }
  }

  return errores;
}

// ----------------------------------------------------------------------------
// MISIÓN 4 · RF5 — ¿Cuántos pedidos hay en cada estado?
// ----------------------------------------------------------------------------
// Devuelve un objeto con TODOS los estados como llave, aunque tengan 0:
//   { registrado: 3, en_preparacion: 3, listo: 2, entregado: 2 }
// Con una lista vacía, todos van en 0.
export function resumenPorEstado(pedidos) {
  const resumen = {
    "registrado": 0,
    "en preparación": 0,
    "listo": 0,
    "entregado": 0
  };

  if (!pedidos || !Array.isArray(pedidos)) return resumen;

  for (let pedido of pedidos) {
    if (pedido && pedido.estado) {
      if (resumen[pedido.estado] !== undefined) {
        resumen[pedido.estado]++;
      } else {
        resumen[pedido.estado] = 1;
      }
    }
  }
  return resumen;
}

// ----------------------------------------------------------------------------
// MISIÓN 5 · RF5 — Buscar pedidos por nombre de cliente
// ----------------------------------------------------------------------------
// Devuelve los pedidos cuyo cliente CONTIENE el texto buscado, sin importar
// mayúsculas ni acentos: "ramirez" encuentra a "Ana Ramírez" y "JOSÉ" a
// "José Martínez". Un texto vacío (o solo espacios) devuelve todos.
// Pista: 'Ramírez'.normalize('NFD').replace(/[̀-ͯ]/g, '')
//        Investiga qué hace NFD. Es un problema real en sistemas en español.
export function buscarPedidos(pedidos, textoBusqueda) {
  if (!pedidos || !Array.isArray(pedidos)) return [];
  if (!textoBusqueda || typeof textoBusqueda !== "string") return pedidos;

  const normalizar = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const termino = normalizar(textoBusqueda.trim());

  if (termino === "") return pedidos;

  return pedidos.filter((pedido) => {
    if (!pedido || !pedido.cliente || !pedido.cliente.nombre) return false;
    return normalizar(pedido.cliente.nombre).includes(termino);
  });
}
// ----------------------------------------------------------------------------
// MISIÓN 6 · DESTACADO — Los mejores clientes
// ----------------------------------------------------------------------------
// Devuelve los `n` clientes que más han gastado, sumando el total de TODOS sus
// pedidos (reutiliza totalPedido, no copies la lógica).
// Formato: [{ cliente: 'Ana Ramírez', total: 1316 }, ...]
// Orden: total de mayor a menor; si empatan, por nombre alfabético.
// Pista: un objeto acumulador, luego Object.entries, map y sort.
export function topClientesDestacado(pedidos) {
  if (!pedidos || !Array.isArray(pedidos)) return [];
  const acumulado = {};

  for (let pedido of pedidos) {
    if (!pedido || !pedido.cliente || !pedido.cliente.nombre) continue;
    const nombre = pedido.cliente.nombre;
    const total = totalPedido(pedido);
    acumulado[nombre] = (acumulado[nombre] || 0) + total;
  }

  const resultado = Object.keys(acumulado).map((nombre) => ({
    nombre,
    total: acumulado[nombre]
  }));

  resultado.sort((a, b) => b.total - a.total);
  return resultado;
} 