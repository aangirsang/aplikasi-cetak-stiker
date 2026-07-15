package com.girsang.stiker.model.dto.response

import com.girsang.stiker.model.entity.DataBarang
import com.girsang.stiker.model.entity.DataPengguna

data class PenyesuaianStokResponse(
    val id: String,
    var dataBarangId: String,
    var namaBarang: String,
    var dataBarang: DataBarang,
    var dataPenggunaId: String,
    var namaPengguna: String,
    var tanggal: Long,
    var stokSistem: Long,
    var stokFisik: Long,
    var selisih: Long,
    var pathGambar: String,
    var alasan: String
)