package com.girsang.stiker.model.dto.request

data class DataStikerRequest(
    var umkmId: String,
    var barangId: String,
    var namaStiker: String,
    var panjang: Int = 0,
    var lebar: Int = 0,
    var catatan: String? = "-",
    var status: Boolean = true,
    var pathGambar1: String = "",
    var pathGambar2: String = ""
)