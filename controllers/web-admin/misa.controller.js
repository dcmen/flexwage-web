const axios = require('axios');
const crypto = require('crypto');

const MISA_ORG_URL =
  'https://amisapp.misa.vn/APIS/HRMProfileOpenAPI/api/Open/get-organizationunit';

function createMisaToken(secretKey, input) {
  return crypto.createHmac('sha256', secretKey).update(input, 'utf8').digest('base64');
}

async function postMisa(url, clientId, secretKey, body) {
  const transactionId = crypto.randomUUID();
  const xToken = createMisaToken(secretKey, transactionId);
  const response = await axios.post(url, body, {
    headers: {
      'Content-Type': 'application/json',
      'x-clientid': clientId,
      'x-transactionid': transactionId,
      'x-token': xToken,
    },
    timeout: 60000,
    validateStatus: () => true,
  });
  return response.data;
}

function selectPrimaryOrganizationUnit(pageData) {
  if (!Array.isArray(pageData) || pageData.length === 0) return null;
  const byId = new Map(pageData.map((o) => [o.OrganizationUnitID, o]));
  const roots = pageData.filter(
    (o) => o.ParentID == null || o.ParentID === '' || !byId.has(o.ParentID)
  );
  if (roots.length > 0) return roots[0];
  return pageData[0];
}

const getOrganizationUnit = async (req, res) => {
  try {
    const employeeCentralConnectionId = (req.body.employeeCentralConnectionId || '').trim();
    const employeeCentralPasscode = (req.body.employeeCentralPasscode || '').trim();

    if (!employeeCentralConnectionId || !employeeCentralPasscode) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: 'Employee Central Connection ID and Passcode are required.',
      });
    }

    const orgPayload = {
      PageSize: -1,
      PageIndex: 1,
      LastDate: '1970-01-01T00:00:00.000+07:00',
    };

    const data = await postMisa(
      MISA_ORG_URL,
      employeeCentralConnectionId,
      employeeCentralPasscode,
      orgPayload
    );

    if (!data || !data.Success || data.Code !== 0) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: data?.UserMessage || data?.SystemMessage || 'MISA API returned an error.',
        misa: { Code: data?.Code, SubCode: data?.SubCode },
      });
    }

    const pageData = data.Data?.PageData || [];
    const org = selectPrimaryOrganizationUnit(pageData);

    if (!org) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: 'No organization unit returned from MISA.',
      });
    }

    const systemCompany = {
      company_name: org.OrganizationUnitName,
      system_company_id: String(
        org.OrganizationUnitID != null ? org.OrganizationUnitID : org.OrganizationUnitCode
      ),
      short_code: org.OrganizationUnitCode,
      misa_organization_unit_id: org.OrganizationUnitID,
      misa_parent_organization_unit_id: org.ParentID,
    };

    return res.status(200).json({
      code: 200,
      success: true,
      result: {
        organization: org,
        organizations: pageData,
        systemCompany,
        systemUser: null,
      },
    });
  } catch (err) {
    const detail = err.response?.data;
    console.error('[MISA] get-organization-unit', detail || err.message);
    return res.status(500).json({
      code: 500,
      success: false,
      message:
        detail?.UserMessage ||
        detail?.SystemMessage ||
        err.message ||
        'MISA request failed.',
    });
  }
};

module.exports = {
  getOrganizationUnit,
};
