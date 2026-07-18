package com.girsang.stiker.model.dto.response

data class DataOrderanRinciResponse(
    val id: String,
    val dataOrderanId: String,

    //DATA STIKER
    val stikerId: String,
    val kodeStiker: String,
    val namaStiker: String,
    val ukuranStiker: String,
    val pathGambar1: String,

    val jumlah: Int
)