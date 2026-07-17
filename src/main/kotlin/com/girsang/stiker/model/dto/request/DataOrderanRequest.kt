package com.girsang.stiker.model.dto.request

data class DataOrderanRequest(
    val dataPenggunaId: String,
    val dataUmkmId: String,
    val rincian: List<DataOrderanRinciRequest>
)