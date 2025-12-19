AI-Powered Indian Stock Analysis Platform
Overview

This project is a real-time AI-driven investment analysis platform for the Indian stock market (NSE/BSE).
It allows users to search for an Indian stock and instantly receive an explainable Buy / Hold / Avoid assessment, supported by live market data, financial feature engineering, AI-based reasoning, and a downloadable professional report.

The system is designed as a decision-support and research tool for investors, not as a trading or price-prediction system.

Key Features

Near real-time Indian stock prices with timestamps

Deterministic fundamental, technical, and risk analysis

AI-based reasoning using Google Gemini

Downloadable, timestamped PDF investment reports

FastAPI backend with parallel async API calls

Simple Streamlit dashboard (MVP)

India-specific market logic (NSE/BSE only)

SEBI-safe, non-advisory explanations

What This System Does

Fetches continuously refreshed Indian stock market data

Performs feature engineering in Python (not AI-calculated)

Sends structured metrics to an AI reasoning layer

Generates an investment verdict with explanation

Produces a professional PDF report for download

System Architecture
User (Web / Streamlit UI)
        ↓
FastAPI Backend
        ↓
Parallel Async Data Fetching
        ├── Market Price (Near Real-Time)
        ├── Historical OHLC
        ├── Financial Statements
        └── Market Context / News
        ↓
Feature Engineering Layer
        ↓
AI Reasoning Layer (Gemini)
        ↓
Decision Engine
        ↓
Dashboard + PDF Report

Indian Market Focus

This project is strictly built for the Indian stock market:

NSE and BSE listed companies only

Prices, ratios, and valuations in INR

Indian accounting and reporting standards

Promoter, FII, and DII holding considerations

Indian sector and regulatory risk awareness

Real-Time Data Handling
Stock Prices

Prices are fetched from near real-time market data sources

Each price is displayed with a timestamp

The Last Traded Price (LTP) is captured at the moment of analysis and used consistently across:

Dashboard

AI reasoning

PDF report

Note: Exact tick-by-tick NSE/BSE prices require licensed broker APIs.
This system uses the latest available market snapshot, which is the industry-standard approach for retail investment platforms.

Fundamental Data

Financial KPIs (ROE, P/E, Debt-Equity, etc.) are derived from:

Latest published financial statements

Consistent formula-based calculations

Fundamentals are not real-time by nature and are clearly labeled with their reporting period.

This approach prioritizes consistency, transparency, and trust.

Analysis Components
Fundamental Analysis

Profitability (ROE, ROCE)

Growth trends

Debt and balance-sheet strength

Valuation metrics

Long-term business quality

Technical Analysis

Trend direction

Momentum indicators (e.g., RSI)

Support and resistance levels

Entry-price suitability

Risk Analysis

Volatility and beta

Financial leverage

Sector and regulatory risk

Market sentiment

AI Reasoning Layer

The AI component (Google Gemini) acts as a financial analyst, not a calculator.

It:

Interprets structured metrics

Explains investment logic

Assesses risk and suitability

Generates investor-friendly insights

It does not:

Predict stock prices

Give trading calls

Guarantee returns

PDF Report Generation

Each analysis includes a downloadable PDF report containing:

Company overview

Market snapshot with timestamp

Fundamental and technical insights

Risk assessment

AI-generated explanation

Compliance-friendly disclaimer

Tech Stack

Backend: FastAPI (async, high-performance)

AI: Google Gemini (Google AI Studio)

Data Processing: Pandas, NumPy

Concurrency: AsyncIO, Aiohttp

PDF Reports: ReportLab

Frontend (MVP): Streamlit

Getting Started
Clone the Repository
git clone https://github.com/your-username/indian-stock-ai-analysis.git
cd indian-stock-ai-analysis

Install Dependencies
pip install -r requirements.txt

Run Backend
uvicorn main:app --reload --port 8000

Run Frontend
streamlit run frontend.py

Compliance and Ethics

No trading signals or price predictions

Clear timestamps on all market data

Transparent explanation of data limitations

SEBI-safe disclaimer language

This project is intended strictly for educational and research purposes.

Future Enhancements

Broker API integration for true tick-level pricing

Portfolio-level risk analysis

Sector-wise peer comparison

Batch analysis of multiple stocks

Cloud deployment (GCP or AWS)

Disclaimer

This project is for informational and educational purposes only.
It does not constitute investment advice.
Stock market investments are subject to market risk.

Author

Swaroop
Aspiring Data Scientist and AI and FinTech Enthusiast
