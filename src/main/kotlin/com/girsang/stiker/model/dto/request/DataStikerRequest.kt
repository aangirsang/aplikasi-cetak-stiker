package com.girsang.stiker.model.dto.request

import com.girsang.stiker.model.entity.DataUmkm

data class DataStikerRequest(
    var dataUmkmId: String,
    var umkmId: String,
    var namaStiker: String = "",
    var panjang: Int = 0,
    var lebar: Int = 0,
    var catatan: String? = "",
    var status: Boolean = true,
    var pathGambar1: String = "",
    var pathGambar2: String = ""
)