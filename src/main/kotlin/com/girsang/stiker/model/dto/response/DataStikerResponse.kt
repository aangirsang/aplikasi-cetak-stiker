package com.girsang.stiker.model.dto.response

import com.girsang.stiker.model.entity.DataBarang
import com.girsang.stiker.model.entity.DataUmkm

data class DataStikerResponse(
    val id: String = "",
    var dataUmkm: DataUmkm,
    var umkmId: String,
    var dataBarang: DataBarang,
    var kodeStiker: String = "",
    var namaStiker: String = "",
    var panjang: Int = 0,
    var lebar: Int = 0,
    var ukuran: String = "",
    var catatan: String? = "",
    var status: Boolean = true,
    var pathGambar1: String = "",
    var pathGambar2: String = ""
)