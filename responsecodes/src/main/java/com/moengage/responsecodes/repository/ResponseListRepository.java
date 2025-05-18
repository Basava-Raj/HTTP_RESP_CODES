package com.moengage.responsecodes.repository;

import com.moengage.responsecodes.model.ResponseList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResponseListRepository extends JpaRepository<ResponseList, Long> {

    List<ResponseList> findByUserId(Long userId);
}
