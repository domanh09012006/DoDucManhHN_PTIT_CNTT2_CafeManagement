package com.example.coffeemanagement.service;

import com.example.coffeemanagement.dto.response.DashboardResponse;
import com.example.coffeemanagement.dto.response.RevenueReportResponse;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {

    DashboardResponse getDashboard();

    List<RevenueReportResponse> getRevenueReport(LocalDate from, LocalDate to);
}
