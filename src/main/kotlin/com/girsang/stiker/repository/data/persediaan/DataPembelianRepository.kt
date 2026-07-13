package com.girsang.stiker.repository.data.persediaan

import com.girsang.stiker.model.entity.DataPembelian
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DataPembelianRepository: JpaRepository<DataPembelian, String>