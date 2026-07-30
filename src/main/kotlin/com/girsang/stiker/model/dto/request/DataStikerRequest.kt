package com.girsang.stiker.model.dto.request

data class DataStikerRequest(
    var umkmId: String,
    var barangId: String,
    var namaStiker: String,
    var panjang: Double = 0.0,
    var lebar: Double = 0.0,
    var catatan: String? = "-",
    var status: Boolean = true,
    var pathGambar1: String = "",
    var pathGambar2: String = "",
    var pathTIF: String = "",

    // DATA LAYOUT CETAK
    var lebarKertas: Double = 0.0,
    var tinggiKertas: Double = 0.0,
    var offsetX: Double = 0.0,
    var offsetY: Double = 0.0
)