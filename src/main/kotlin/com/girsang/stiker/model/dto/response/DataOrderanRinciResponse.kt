package com.girsang.stiker.model.dto.response

data class DataOrderanRinciResponse(
    val id: String,
    val dataOrderanId: String,
    val stiketId: String,
    val kodeStiker: String,
    val namaStiker: String,
    val ukuranStiker: String,
    val jumlah: Int
)