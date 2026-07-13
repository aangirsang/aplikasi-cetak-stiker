package com.girsang.stiker.model.dto.response

import java.math.BigDecimal

data class PembelianResponse(

    val id: String,
    val dataPenggunaId: String,
    val namaPengguna: String,
    val tanggal: Long,
    val subtotal: BigDecimal = BigDecimal.ZERO,
    val rincian: List<PembelianRinciResponse>

)