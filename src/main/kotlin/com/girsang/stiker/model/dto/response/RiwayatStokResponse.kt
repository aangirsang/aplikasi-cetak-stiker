package com.girsang.stiker.model.dto.response

data class RiwayatStokResponse (
    val id: String,

    val dataBarangId: String?,
    val namaBarang: String,

    val tanggal: Long,

    val jenis: String,

    val referensiId: String,
    val perubahan: Long,
    val saldoAwal: Long,
    val saldoAkhir: Long,

    val dataPenggunaId: String,
    val namaPengguna: String,

    val keterangan: String? = null
)