package com.girsang.stiker.model.dto.response

data class DataOrderanRinciResponse(
    val id: String,
    val dataOrderanId: String,

    //DATA STIKER
    val stikerId: String,
    val kodeStiker: String,
    val namaStiker: String,
    val ukuranStiker: String,
    var panjang: Int = 0,
    var lebar: Int = 0,
    var status: Boolean = true,
    var catatan: String? = "",
    val pathGambar1: String,
    val pathGambar2: String,
    val jumlah: Int,
    var pathCDR: String = ""
)