%% ============================================================
%% DANSK INVESTERINGSBESKATNING - KOMPLET OVERSIGT
%% Med detaljeret kapitalindkomst-flow
%% Version: 2026-02-06 v9 (finansielle kontrakter først, blandede fonde til sidst sammen)
%% ============================================================

flowchart TD
    START[Investor har en investering] --> KONTO{Hvilken kontotype?}

    %% ====== FRI DEPOT ======
    KONTO -->|Fri Depot| FD_AKTIV{Aktivtype i Fri Depot}

    FD_AKTIV -->|Finansielle kontrakter - CFD futures optioner| FD_FIN[Kapitalindkomst<br>Lagerbeskatning<br>KGL paragraf 29<br>Kildeartsbegr. tab isoleret]
    FD_AKTIV -->|Obligationer direkte og renter| FD_OBL[Kapitalindkomst<br>Realisationsbeskatning<br>ca 37-42 pct]
    FD_AKTIV -->|Obligationsbaseret ETF eller fond| FD_OBL_FOND[Kapitalindkomst<br>ALTID - uanset akk eller udb<br>Lagerbeskatning<br>ca 37-42 pct]
    FD_AKTIV -->|ETF IKKE paa positivlisten| FD_ETF_NEG[Kapitalindkomst<br>Lagerbeskatning<br>ca 37-42 pct]
    FD_AKTIV -->|Akkumulerende fond IKKE paa positivlisten| FD_AKK_NEG[Kapitalindkomst<br>Lagerbeskatning<br>ca 37-42 pct]
    FD_AKTIV -->|ETF paa positivlisten| FD_ETF_POS[Aktieindkomst<br>Lagerbeskatning<br>27 pct / 42 pct]
    FD_AKTIV -->|Akkumulerende fond paa positivlisten| FD_AKK_POS[Aktieindkomst<br>Lagerbeskatning<br>27 pct / 42 pct]
    FD_AKTIV -->|Udbyttebetalende fond - aktiebaseret| FD_UDB[Aktieindkomst<br>Realisationsbeskatning<br>27 pct / 42 pct]
    FD_AKTIV -->|Aktier - alle| FD_AKT_IND[Aktieindkomst<br>Realisationsbeskatning<br>27 pct / 42 pct]
    FD_AKTIV -->|Blandet fond over 50 pct obligationer| FD_BLANDET_OBL[Kapitalindkomst<br>ca 37-42 pct]
    FD_AKTIV -->|Blandet fond over 50 pct aktier| FD_BLANDET_AKT[Aktieindkomst<br>27 pct / 42 pct]

    %% ====== KAPITALINDKOMST DETALJE ======
    FD_OBL --> KAP_FLOW
    FD_OBL_FOND --> KAP_FLOW
    FD_ETF_NEG --> KAP_FLOW
    FD_AKK_NEG --> KAP_FLOW
    FD_BLANDET_OBL --> KAP_FLOW
    FD_FIN --> FIN_FLOW

    KAP_FLOW{Positiv eller negativ kapitalindkomst?}
    KAP_FLOW -->|Positiv gevinst| KAP_POS[Beskattes som personlig indkomst<br>Bundskat 12,01 pct<br>Kommuneskat ca 25 pct<br>Kirkeskat ca 0,7 pct<br>Over 55.000 kr indgaar i mellemskat PSL 7<br>Skatteloft kapitalindkomst 42 pct PSL 19 stk 2<br>Samlet ca 37-42 pct]
    KAP_FLOW -->|Negativt tab| KAP_NEG{Negativ kapitalindkomst<br>Er samlet negativt under 50.000 kr?}

    KAP_NEG -->|Under 50.000 kr enlig<br>Under 100.000 kr gift| KAP_NEG_LAV[Fradragsvaerdi ca 33 pct<br>8 pct ekstra nedslag<br>plus kommuneskat ca 25 pct<br>Bruges KUN i samme aar<br>INTET fremfoersel]
    KAP_NEG -->|Over graensen| KAP_NEG_HOJ[Fradragsvaerdi ca 25 pct<br>Kun kommuneskat<br>Bruges KUN i samme aar<br>INTET fremfoersel]

    %% ====== FINANSIELLE KONTRAKTER DETALJE ======
    FIN_FLOW{Finansielle kontrakter<br>Gevinst eller tab?}
    FIN_FLOW -->|Gevinst| FIN_GEV[Kapitalindkomst<br>Beskattes ca 37-42 pct<br>Lagerbeskatning aarligt]
    FIN_FLOW -->|Tab| FIN_TAB[Kildeartsbegr. - isoleret tabspool<br>Tab KUN mod andre finansielle kontrakter<br>Fremfoeres uendeligt<br>Aegtefaelle KAN overfoere tab<br>KGL paragraf 32]

    %% ====== AKTIEINDKOMST TAB ======
    FD_ETF_POS --> AKT_TAB_FLOW
    FD_AKK_POS --> AKT_TAB_FLOW
    FD_UDB --> AKT_TAB_FLOW
    FD_AKT_IND --> AKT_TAB_FLOW
    FD_BLANDET_AKT --> AKT_TAB_FLOW

    AKT_TAB_FLOW{Aktieindkomst<br>Gevinst eller tab?}
    AKT_TAB_FLOW -->|Gevinst| AKT_GEV[27 pct op til 79.400 kr enlig<br>42 pct derover<br>Progressionsgraense deles med aegtefaelle]
    AKT_TAB_FLOW -->|Tab noterede| AKT_TAB[Kildeartsbegr ABL 13A<br>KUN mod andre noterede plus positivliste<br>Obligatorisk overfoersel til aegtefaelle<br>Fremfoer uendeligt - tabsbank]
    AKT_TAB_FLOW -->|Tab unoterede| AKT_TAB_UNOT[Fuldt fradrag i AL aktieindkomst<br>IKKE kildeartsbegr ABL 13<br>Negativ aktieindkomst giver skattevaerdi i slutskat<br>Valgfri aegtefaelle-overfoersel<br>Fremfoeres uendeligt]

    %% ====== ASK ======
    KONTO -->|ASK| ASK[17 pct lagerbeskatning<br>KUN aktieindkomst-papirer tilladt<br>Obligationsfonde IKKE tilladt<br>Personfradrag kan IKKE bruges<br>Loft 174.200 kr 2026]
    ASK --> ASK_TAB{Gevinst eller tab?}
    ASK_TAB -->|Gevinst| ASK_GEV[17 pct af aarets afkast]
    ASK_TAB -->|Tab| ASK_TABD[Fremfoeres KUN paa samme ASK<br>Mistes HELT ved lukning<br>Ingen aegtefaelle]

    %% ====== PENSION ======
    KONTO -->|Pension| PENS[15,3 pct PAL-skat<br>Alt tilladt<br>Lagerbeskatning]
    PENS --> PENS_TAB{Gevinst eller tab?}
    PENS_TAB -->|Gevinst| PENS_GEV[15,3 pct af aarets afkast]
    PENS_TAB -->|Tab| PENS_TABD[Fremfoeres paa samme ordning<br>Ingen aegtefaelle]

    %% ====== BOERNEOPSPARING ======
    KONTO -->|Boerneopsparing| BOERN[0 pct skat<br>Alt tilladt<br>Max 6.000 kr pr aar<br>Max 72.000 kr total<br>Udbetaling senest 21 aar]

    %% ====== STYLING ======
    style FD_AKT_IND fill:#e3f2fd,stroke:#1565c0
    style FD_ETF_POS fill:#e3f2fd,stroke:#1565c0
    style FD_UDB fill:#e3f2fd,stroke:#1565c0
    style FD_AKK_POS fill:#e3f2fd,stroke:#1565c0

    style FD_ETF_NEG fill:#fce4ec,stroke:#c62828
    style FD_AKK_NEG fill:#fce4ec,stroke:#c62828
    style FD_FIN fill:#fce4ec,stroke:#c62828
    style FD_OBL fill:#fce4ec,stroke:#c62828
    style FD_OBL_FOND fill:#fce4ec,stroke:#c62828
    style FD_BLANDET_OBL fill:#fce4ec,stroke:#c62828
    style FD_BLANDET_AKT fill:#e3f2fd,stroke:#1565c0

    style KAP_POS fill:#ffebee,stroke:#b71c1c
    style KAP_NEG_LAV fill:#ffcdd2,stroke:#c62828
    style KAP_NEG_HOJ fill:#ef9a9a,stroke:#b71c1c

    style FIN_GEV fill:#ffebee,stroke:#b71c1c
    style FIN_TAB fill:#d50000,stroke:#b71c1c,color:#fff

    style AKT_GEV fill:#bbdefb,stroke:#1565c0
    style AKT_TAB fill:#90caf9,stroke:#0d47a1
    style AKT_TAB_UNOT fill:#64b5f6,stroke:#0d47a1

    style ASK fill:#f3e5f5,stroke:#6a1b9a
    style ASK_GEV fill:#e1bee7,stroke:#6a1b9a
    style ASK_TABD fill:#ce93d8,stroke:#4a148c

    style PENS fill:#e8f5e9,stroke:#2e7d32
    style PENS_GEV fill:#c8e6c9,stroke:#2e7d32
    style PENS_TABD fill:#a5d6a7,stroke:#1b5e20

    style BOERN fill:#fff3e0,stroke:#ef6c00
