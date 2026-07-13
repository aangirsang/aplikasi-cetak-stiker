package com.girsang.stiker.model.dto.response

import java.math.BigDecimal

data class PembelianRinciResponse(

    val id: String,
    val dataBarangId: String?,
    val tanggal: Long,
    val namaBarang: String,
    val harga: BigDecimal = BigDecimal.ZERO,
    val jumlah: Long,
    val total: BigDecimal = BigDecimal.ZERO

)