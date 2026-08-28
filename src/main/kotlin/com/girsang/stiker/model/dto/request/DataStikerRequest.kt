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

    // DATA LAYOUT CETAK
    var layoutID: String = "",
    var pathTIF: String = "",
    var kertas: String = "",
    var lebarKertas: Double = 0.0,
    var tinggiKertas: Double = 0.0,
    var offsetX: Double = 0.0,
    var offsetY: Double = 0.0,
    var width: Double = 0.0,
    var height: Double = 0.0,
    var dpiX: Double = 0.0,
    var dpiY: Double = 0.0,
    var imageWidthMM: Double = 0.0,
    var imageHeightMM: Double = 0.0,

)