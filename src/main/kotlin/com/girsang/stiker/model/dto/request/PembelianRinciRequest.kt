package com.girsang.stiker.model.dto.request

import java.math.BigDecimal

data class PembelianRinciRequest(

    val dataBarangId: String,
    val harga: BigDecimal = BigDecimal.ZERO,
    val jumlah: Long

)