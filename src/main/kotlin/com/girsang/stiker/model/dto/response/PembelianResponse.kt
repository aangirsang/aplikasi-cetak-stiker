package com.girsang.stiker.model.dto.response

import java.math.BigDecimal

data class PembelianResponse(

    val id: Long,
    val dataPenggunaId: Long,
    val namaPengguna: String,
    val tanggal: Long,
    val subtotal: BigDecimal = BigDecimal.ZERO,
    val rincian: List<PembelianRinciResponse>

)