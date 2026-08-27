package com.girsang.stiker.model.dto.response

data class DataOrderanRinciResponse(
    val id: String,
    val dataOrderanId: String,
    val namaPengguna: String,
    val namaUmkm: String,
    val faktur: String,
    val tanggal: Long,

    //DATA STIKER
    val stikerId: String,
    val kodeStiker: String,
    val namaStiker: String,
    val ukuranStiker: String,
    var panjang: Double = 0.0,
    var lebar: Double = 0.0,
    var status: Boolean = true,
    var catatan: String? = "",
    val pathGambar1: String,
    val pathGambar2: String,
    val jumlah: Int,
    var pathTIF: String = ""
)

data class DataTabelOrderanRinciResponse(
    val id: String,
    val stikerId: String,
    val kodeStiker: String,
    val namaStiker: String,
    val ukuranStiker: String,
    val jumlah: Int,
)