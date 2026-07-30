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
    var panjang: Double = 0.0,
    var lebar: Double = 0.0,
    var ukuran: String = "",
    var catatan: String? = "",
    var status: Boolean = true,
    var pathGambar1: String = "",
    var pathGambar2: String = "",
    var pathTIF: String = "",
    var lebarKertas: Double = 0.0,
    var tinggiKertas: Double = 0.0,
    var offsetX: Double = 0.0,
    var offsetY: Double = 0.0,
    var dibuatPada: Long,
    var diubahPada: Long
)