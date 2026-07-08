package com.girsang.stiker.model.dto.response

data class RiwayatStokResponse (
    val id: Long,

    val dataBarangId: Long,
    val namaBarang: String,

    val tanggal: Long,

    val jenis: String,

    val referensiId: Long,
    val perubahan: Long,
    val saldoAwal: Long,
    val saldoAkhir: Long,

    val dataPenggunaId: Long,
    val namaPengguna: String,

    val keterangan: String? = null
)