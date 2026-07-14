package com.girsang.stiker.repository

import com.girsang.stiker.model.entity.DataPembelian
import org.springframework.data.jpa.repository.JpaRepository

interface DataPembelianRepository: JpaRepository<DataPembelian, String>