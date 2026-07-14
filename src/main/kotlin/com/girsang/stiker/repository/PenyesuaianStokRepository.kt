package com.girsang.stiker.repository

import com.girsang.stiker.model.entity.DataPenyesuaianStok
import org.springframework.data.jpa.repository.JpaRepository

interface PenyesuaianStokRepository: JpaRepository<DataPenyesuaianStok, String>