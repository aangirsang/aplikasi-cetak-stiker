package com.girsang.stiker.model.dto.request

class BarangRusakRequest(
    val idPengguna: String,
    val idBarang: String,
    val jumlah: Long,
    val catatan: String,
    val pathGambar: String
)