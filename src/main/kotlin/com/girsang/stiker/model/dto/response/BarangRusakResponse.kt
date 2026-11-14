package com.girsang.stiker.model.dto.response

class BarangRusakResponse(
    val id: String,
    val idPengguna: String,
    val namaPengguna: String,
    val idBarang: String,
    val namaBarang: String,
    val tanggal: Long,
    val jumlah: Long,
    val catatan: String,
    val pathGambar: String
)