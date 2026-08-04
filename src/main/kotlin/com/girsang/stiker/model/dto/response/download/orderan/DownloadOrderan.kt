package com.girsang.stiker.model.dto.response.download.orderan

data class RekapUmkmResponse(
    val umkmId: String,
    val namaUmkm: String,
    val jumlah: Long
)

data class RekapStikerResponse(
    val stikerId: String,
    val namaUmkm: String,
    val kodeStiker: String,
    val namaStiker: String,
    val panjang: Double = 0.0,
    val lebar: Double = 0.0,
    val jumlah: Long
)

data class RekapOrderanBulananResponse(
    val bulan: Int,
    val tahun: Int,
    val jumlah: Long
)