package com.girsang.stiker.model.dto.response

data class PenyesuaianStokResponse(
    val id: String,
    var dataBarangId: String,
    var namaBarang: String,
    var stokBarang: Long,
    var dataPenggunaId: String,
    var namaPengguna: String,
    var tanggal: Long,
    var stokSistem: Long,
    var stokFisik: Long,
    var selisih: Long,
    var pathGambar: String,
    var alasan: String
)