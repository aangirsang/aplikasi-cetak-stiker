package com.girsang.stiker.model.dto.request

data class PenyesuaianStokRequest(
    var dataBarangId: String,
    var dataPenggunaId: String,
    var stokSistem: Long,
    var stokFisik: Long,
    var selisih: Long,
    var pathGambar: String = "",
    var alasan: String
)