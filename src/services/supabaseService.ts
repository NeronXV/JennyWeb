import { supabase } from '../lib/supabaseClient';
import type { Alumno, AsistenciaRegistro, Lote, Producto, Venta } from '../context/AppContext';

// --- ALUMNOS ---
export async function fetchAlumnosFromSupabase(): Promise<Alumno[] | null> {
  try {
    const { data, error } = await supabase.from('alumnos').select('*');
    if (error) {
      console.warn('Supabase fetch alumnos error:', error.message);
      return null;
    }
    if (!data) return null;

    return data.map((item: any) => ({
      id: item.id,
      nombre: item.nombre,
      curp: item.curp,
      sexo: item.sexo,
      fechaNacimiento: item.fecha_nacimiento,
      grado: item.grado,
      grupo: item.grupo,
      promedio: Number(item.promedio) || 8.0,
      asistenciasCount: Number(item.asistencias_count) || 0,
      faltasCount: Number(item.faltas_count) || 0,
      retardosCount: Number(item.retardos_count) || 0,
      calificaciones: item.calificaciones || {}
    }));
  } catch (err) {
    console.warn('Supabase fetch error:', err);
    return null;
  }
}

export async function upsertAlumnoToSupabase(alumno: Alumno) {
  try {
    await supabase.from('alumnos').upsert({
      id: alumno.id,
      nombre: alumno.nombre,
      curp: alumno.curp,
      sexo: alumno.sexo,
      fecha_nacimiento: alumno.fechaNacimiento,
      grado: alumno.grado,
      grupo: alumno.grupo,
      promedio: alumno.promedio,
      asistencias_count: alumno.asistenciasCount,
      faltas_count: alumno.faltasCount,
      retardos_count: alumno.retardosCount,
      calificaciones: alumno.calificaciones
    });
  } catch (err) {
    console.warn('Error upserting alumno to Supabase:', err);
  }
}

export async function deleteAlumnoFromSupabase(id: string) {
  try {
    await supabase.from('alumnos').delete().eq('id', id);
  } catch (err) {
    console.warn('Error deleting alumno from Supabase:', err);
  }
}

// --- ASISTENCIAS ---
export async function fetchAsistenciasFromSupabase(): Promise<AsistenciaRegistro[] | null> {
  try {
    const { data, error } = await supabase.from('asistencias').select('*');
    if (error || !data) return null;

    return data.map((item: any) => ({
      fecha: item.fecha,
      status: item.status || {}
    }));
  } catch (err) {
    return null;
  }
}

export async function saveAsistenciaToSupabase(fecha: string, status: Record<string, string>) {
  try {
    await supabase.from('asistencias').upsert({
      fecha,
      status
    });
  } catch (err) {
    console.warn('Error saving asistencia to Supabase:', err);
  }
}

// --- LOTES ---
export async function fetchLotesFromSupabase(): Promise<Lote[] | null> {
  try {
    const { data, error } = await supabase.from('lotes').select('*');
    if (error || !data) return null;

    return data.map((item: any) => ({
      id: item.id,
      nombre: item.nombre,
      fecha: item.fecha,
      inversion: Number(item.inversion) || 0,
      ventas: Number(item.ventas) || 0,
      ganancia: Number(item.ganancia) || 0,
      productosRestantes: Number(item.productos_restantes) || 0,
      estado: item.estado || 'Activo'
    }));
  } catch (err) {
    return null;
  }
}

export async function upsertLoteToSupabase(lote: Lote) {
  try {
    await supabase.from('lotes').upsert({
      id: lote.id,
      nombre: lote.nombre,
      fecha: lote.fecha,
      inversion: lote.inversion,
      ventas: lote.ventas,
      ganancia: lote.ganancia,
      productos_restantes: lote.productosRestantes,
      estado: lote.estado
    });
  } catch (err) {
    console.warn('Error saving lote to Supabase:', err);
  }
}

// --- PRODUCTOS ---
export async function fetchProductosFromSupabase(): Promise<Producto[] | null> {
  try {
    const { data, error } = await supabase.from('productos').select('*');
    if (error || !data) return null;

    return data.map((item: any) => ({
      id: item.id,
      descripcion: item.descripcion,
      categoria: item.categoria,
      talla: item.talla,
      costo: Number(item.costo) || 0,
      precio: Number(item.precio) || 0,
      cantidad: Number(item.cantidad) || 1,
      loteId: item.lote_id,
      notas: item.notas || '',
      estado: item.estado || 'Disponible',
      foto: item.foto || null
    }));
  } catch (err) {
    return null;
  }
}

export async function upsertProductoToSupabase(producto: Producto) {
  try {
    await supabase.from('productos').upsert({
      id: producto.id,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      talla: producto.talla,
      costo: producto.costo,
      precio: producto.precio,
      cantidad: producto.cantidad,
      lote_id: producto.loteId,
      notas: producto.notas,
      estado: producto.estado,
      foto: producto.foto
    });
  } catch (err) {
    console.warn('Error saving producto to Supabase:', err);
  }
}

export async function deleteProductoFromSupabase(id: string) {
  try {
    await supabase.from('productos').delete().eq('id', id);
  } catch (err) {
    console.warn('Error deleting producto from Supabase:', err);
  }
}

// --- VENTAS ---
export async function fetchVentasFromSupabase(): Promise<Venta[] | null> {
  try {
    const { data, error } = await supabase.from('ventas').select('*');
    if (error || !data) return null;

    return data.map((item: any) => ({
      id: item.id,
      productoId: item.producto_id,
      precioFinal: Number(item.precio_final) || 0,
      cliente: item.cliente,
      formaPago: item.forma_pago,
      fecha: item.fecha
    }));
  } catch (err) {
    return null;
  }
}

export async function insertVentaToSupabase(venta: Venta) {
  try {
    await supabase.from('ventas').insert({
      id: venta.id,
      producto_id: venta.productoId,
      precio_final: venta.precioFinal,
      cliente: venta.cliente,
      forma_pago: venta.formaPago,
      fecha: venta.fecha
    });
  } catch (err) {
    console.warn('Error saving venta to Supabase:', err);
  }
}
