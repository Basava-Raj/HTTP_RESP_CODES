package com.moengage.responsecodes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "response_code_item")
public class ResponseCodeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String responseCodes;
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "list_id")
    private ResponseList responseList;
}
