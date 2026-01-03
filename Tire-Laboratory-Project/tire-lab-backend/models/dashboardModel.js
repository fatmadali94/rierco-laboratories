import pool from '../db.js';


  // 1. Count of entry_codes based on date
  export const getEntryCountsByDate = async (startDate, endDate) => {
    const query = `
      SELECT 
  ne_company_entry_date AS date,
  COUNT(entry_code) AS count
FROM dashboard 
WHERE ne_company_entry_date BETWEEN $1 AND $2
GROUP BY ne_company_entry_date
ORDER BY ne_company_entry_date ASC
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }

  // 2. Sum of ne.number_of_rings based on date
  export const getRingsSumByDate = async (startDate, endDate) => {
    const query = `
      SELECT 
        ne_company_entry_date as date,
        SUM(ne_number_of_rings) as total_rings
      FROM dashboard 
      WHERE ne_company_entry_date BETWEEN $1 AND $2
      GROUP BY ne_company_entry_date
      ORDER BY ne_company_entry_date ASC
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }

  // 3. Count of entry_codes based on ne.size in a period of time
  export const getEntryCountsTotalsBySize = async (startDate, endDate) => {
  const query = `
    SELECT 
      ne_size AS size,
      COUNT(entry_code) AS count
    FROM dashboard
    WHERE ne_company_entry_date BETWEEN $1 AND $2
    GROUP BY ne_size
    ORDER BY count DESC
  `;
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows; // each row: { size: "205/55R16", total: 12 }
};


  // 4. Count of entry_codes based on ne.brand in a period of time
  export const getEntryCountsByBrand = async (startDate, endDate) => {
    const query = `
      SELECT 
        ne_brand as brand,
        COUNT(entry_code) as count
      FROM dashboard 
      WHERE ne_company_entry_date BETWEEN $1 AND $2
      GROUP BY  ne_brand
      ORDER BY  count DESC
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }

  // 5. Count of entry_codes based on rr.customers in a period of time
  export const getEntryCountsByCustomer = async (startDate, endDate) => {
    const query = `
      SELECT 
        rr_customers as customer,
        COUNT(entry_code) as count
      FROM dashboard 
      WHERE ne_company_entry_date BETWEEN $1 AND $2
      GROUP BY rr_customers
      ORDER BY count DESC
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }


export const getTestsByDate = async (startDate, endDate) => {
  const query = `
    SELECT
      rr_standard AS standard,
      unnest(rr_tests) AS test,
      COUNT(*) AS total
    FROM dashboard
    WHERE ne_company_entry_date BETWEEN $1 AND $2
    GROUP BY rr_standard, test
    ORDER BY rr_standard, total DESC
  `;
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows; 
};




  // 7. Count of entry_codes based on lr.tire_type in a period of time
  export const getEntryCountsByTireType = async (startDate, endDate) => {
    const query = `
      SELECT 
        lr_tire_type as tire_type,
        COUNT(entry_code) as total
      FROM dashboard 
      WHERE ne_company_entry_date BETWEEN $1 AND $2
      GROUP BY lr_tire_type
      ORDER BY total DESC
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }

  // 8. Count of entry_codes based on lr.tire_group in a period of time
  export const getEntryCountsByTireGroup = async (startDate, endDate) => {
    const query = `
      SELECT 
        lr_tire_group as tire_group,
        COUNT(entry_code) as total
      FROM dashboard 
      WHERE ne_company_entry_date BETWEEN $1 AND $2
      GROUP BY lr_tire_group
      ORDER BY total DESC
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }

  // 9. Entry_codes that lr.laboratory_confirmation is equal to yes or no
  export const getLabConfirmationStatus = async () => {
    const query = `
      SELECT 
        lr_laboratory_confirmation as confirmation_status,
        COUNT(entry_code) as count
      FROM dashboard 
      WHERE lr_laboratory_confirmation IN ('yes', 'no')
      GROUP BY lr_laboratory_confirmation
      ORDER BY confirmation_status
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // 10-18. Sum queries for depository records
  export const getDepositorySumsTotal = async (startDate, endDate) => {
  const query = `
    SELECT 
      COALESCE(SUM(dr_remained_a), 0) AS total_remained_a,
      COALESCE(SUM(dr_remained_b), 0) AS total_remained_b,
      COALESCE(SUM(dr_remained_c), 0) AS total_remained_c,
      COALESCE(SUM(dr_owner_delivery_type_a), 0) AS total_delivery_type_a,
      COALESCE(SUM(dr_owner_delivery_type_b), 0) AS total_delivery_type_b,
      COALESCE(SUM(dr_owner_delivery_type_c), 0) AS total_delivery_type_c,
      COALESCE(SUM(dr_auction_a), 0) AS total_auction_a,
      COALESCE(SUM(dr_auction_b), 0) AS total_auction_b,
      COALESCE(SUM(dr_auction_c), 0) AS total_auction_c
    FROM dashboard
    WHERE ne_company_entry_date BETWEEN $1 AND $2
  `;
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows[0]; // single totals row
};


  // 19. All columns for Excel export
  export const getAllData = async (startDate, endDate) => {
  const query = `
    SELECT  
    entry_code AS کد_ورودی,
    ne_company_entry_date AS تاریخ_ورود,
    ne_entry_category AS دسته,
    ne_size AS سایز,
    ne_brand AS مارک_تجاری,
    ne_country AS کشور, 
    ne_number_of_rings AS تعداد_حلقه,
    ne_production_week_year AS هفته_سال,
    ne_seal_number AS شماره_پلمپ,
    rr_customers AS مشتری,
    rr_standard AS استاندارد,
    rr_tests AS تست,
    lr_requested_test_code AS کد_تست_درخواستی,
    lr_tire_type AS نوع_تایر,
    lr_radial_bias AS رادیال_بایاس,
    lr_tire_group AS گروه,
    lr_tire_pattern AS الگوی_آج,
    lr_load_index AS شاخص_بار,
    lr_speed_index AS شاخص_سرعت,
    lr_layer_count AS تعداد_لایه,
    lr_load_range AS دامنه_بار,
    lr_e_mark AS E_mark,
    lr_noise AS S,
    lr_wet_grip AS W,
    lr_energy_label AS R,
    lr_tire_wear_indicator AS شاخص_ساییدگی,
    lr_traction_index AS چنگ‌زنی_تایر,
    lr_tire_temperature_index AS شاخص_دما,
    lr_tire_weight AS وزن,
    lr_tire_hardness AS سختی,
    lr_section_width AS عرض_مقطع,
    lr_external_diameter AS قطر_خارجی,
    lr_tread_depth AS عمق_آج,
    lr_performed_tests AS تست_انجام_شده,
    lr_plunger_5 AS پلانجر,
    lr_rim_test AS آزمون_طوقه,
    lr_rolling_result AS نتیجه_طوقه,
    lr_rolling_grade AS گروه_رولینگ,
    lr_noise_result AS نتیجه_نویز,
    lr_wet_grip_grade AS گروه_چسبندگی,
    lr_tire_failure_description AS توضیح_خرابی,
    lr_out_of_demand_tests AS آزمون_خارج_از_درخواست,
    lr_laboratory_confirmation AS نتیجه_آزمون
    FROM dashboard
    WHERE ne_company_entry_date BETWEEN $1 AND $2
      AND entry_code ~ '^\\d+\\-\\d+$'
    ORDER BY
      CAST(SPLIT_PART(entry_code, '-', 1) AS INTEGER) DESC,
      CAST(SPLIT_PART(entry_code, '-', 2) AS INTEGER) DESC
  `;
  const result = await pool.query(query, [startDate, endDate]); 
  return result.rows;
};


  // 19. Depo Data for Excel export
  export const getDepositoryData = async (startDate, endDate) => {
  const query = `
    SELECT 
      entry_code AS کد_ورودی,
      ne_size AS سایز,
      ne_brand AS مارک_تجاری,
      ne_country AS کشور,
      ne_production_week_year AS هفته_سال,
      dr_owner_delivery_count AS تعداد_تحویلی,
      dr_owner_delivery_type_a AS تحویلی_A,
      dr_owner_delivery_type_b AS تحویلی_B,
      dr_owner_delivery_type_c AS تحویلی_C,
      dr_auction_a AS مزایده_A,
      dr_auction_b AS مزایده_B,
      dr_auction_c AS مزایده_C,
      dr_remained_a AS باقیمانده_A,
      dr_remained_b AS باقیمانده_B,
      dr_remained_c AS باقیمانده_C
    FROM dashboard
    WHERE ne_company_entry_date BETWEEN $1 AND $2
      AND entry_code ~ '^\\d+\\-\\d+$'
    ORDER BY
      CAST(SPLIT_PART(entry_code, '-', 1) AS INTEGER) DESC,
      CAST(SPLIT_PART(entry_code, '-', 2) AS INTEGER) DESC
  `;
  const result = await pool.query(query, [startDate, endDate]); 
  return result.rows;
};




  // Additional helper method for date range validation
  export const validateDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format');
    }
    
    if (start > end) {
      throw new Error('Start date cannot be after end date');
    }
    
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }

