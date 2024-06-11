import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Table, Form, InputGroup, FormControl } from 'react-bootstrap';
import TemplatePreview from './TemplatePreview';
import axios from 'axios';
import './Campaigns.css';

const Campaigns = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      const companyId = localStorage.getItem('company_id');
      const token = localStorage.getItem('token');
      if (!companyId || !token) {
        console.error('No company ID or token found');
        return;
      }

      try {
        console.log('Fetching templates with company ID:', companyId);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/templates`, {
          params: { company_id: companyId },
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Fetched templates:', response.data);
        setTemplates(response.data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    const fetchCampaigns = async () => {
      const companyId = localStorage.getItem('company_id');
      const token = localStorage.getItem('token');
      try {
        console.log('Fetching campaigns');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/campaigns`, {
          params: { company_id: companyId },
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Fetched campaigns:', response.data); // Agregar log para depuración
        setCampaigns(response.data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    fetchTemplates();
    fetchCampaigns();
  }, []);

  const handleCreateTemplateClick = () => {
    navigate('/create-template');
  };

  const handleCreateCampaignClick = () => {
    navigate('/create-campaign');
  };

  const handleUseTemplateClick = (template) => {
    console.log('Using template:', template);
  };

  const handleEditTemplateClick = (template) => {
    navigate(`/edit-template/${template.id}`);
  };

  const handleDeleteTemplateClick = async (templateId) => {
    const token = localStorage.getItem('token');
    try {
      console.log('Deleting template with ID:', templateId);
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(templates.filter(template => template.id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleEditCampaignClick = (campaign) => {
    navigate(`/edit-campaign/${campaign.id}`);
  };

  const handleDeleteCampaignClick = async (campaignId) => {
    const token = localStorage.getItem('token');
    try {
      console.log('Deleting campaign with ID:', campaignId);
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(campaigns.filter(campaign => campaign.id !== campaignId));
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const handleLaunchCampaignClick = async (campaignId) => {
    const token = localStorage.getItem('token');
    try {
      console.log('Launching campaign with ID:', campaignId);
      await axios.post(`${process.env.REACT_APP_API_URL}/api/launch-campaign/${campaignId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Campaign launched successfully');
    } catch (error) {
      console.error('Error launching campaign:', error);
      alert('Error launching campaign');
    }
  };

  const replaceVariables = (text, variables) => {
    let replacedText = text;
    variables.forEach(variable => {
      replacedText = replacedText.replace(variable.name, variable.example);
    });
    return replacedText;
  };

  const filteredTemplates = templates.filter(template => {
    return (
      template.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterType ? template.type === filterType : true)
    );
  });

  return (
    <Container className="campaigns-container">
      <Col md={9} className='ms-auto me-auto'>
        <Row className="mb-4 justify-content-center">
          <Col >
            <h2>Plantillas</h2>
          </Col>
          <Col md={4} className="text-end">
            <Button onClick={handleCreateTemplateClick} className="btn-create-template">Crear Plantilla</Button>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md={8} className="templates-list-column">
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Buscar por nombre"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">Filtrar por tipo</option>
                <option value="MARKETING">Marketing</option>
                <option value="UTILITY">Utilidad</option>
              </Form.Select>
            </InputGroup>
            <div className="templates-list">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTemplates.length > 0 ? (
                    filteredTemplates.map(template => (
                      <tr key={template.id} onClick={() => setSelectedTemplate(template)}>
                        <td>{template.nombre}</td>
                        <td>{template.type}</td>
                        <td>
                          <Button variant="success" size="sm" className="me-2" onClick={() => handleUseTemplateClick(template)}>Usar</Button>
                          <Button variant="secondary" size="sm" className="me-2" onClick={() => handleEditTemplateClick(template)}>Editar</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteTemplateClick(template.id)}>Eliminar</Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">No se encontraron plantillas.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Col>
          <Col md={4} className="preview-column">
            <TemplatePreview template={selectedTemplate} />
          </Col>
        </Row>
        <Row className="mt-5">
          <Col>
            <h2>Campañas de WhatsApp</h2>
          </Col>
          <Col className="text-end">
            <Button onClick={handleCreateCampaignClick} className="btn-create-campaign">Crear Campaña</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Objetivo</th>
                  <th>Tipo</th>
                  <th>Plantilla Utilizada</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length > 0 ? (
                  campaigns.map(campaign => (
                    <tr key={campaign.id}>
                      <td>{campaign.name}</td>
                      <td>{campaign.objective}</td>
                      <td>{campaign.type}</td>
                      <td>{campaign.template_name}</td>
                      <td>
                        <Button variant="info" size="sm" className="me-2" onClick={() => handleEditCampaignClick(campaign)}>Ver</Button>
                        <Button variant="secondary" size="sm" className="me-2" onClick={() => handleEditCampaignClick(campaign)}>Editar</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteCampaignClick(campaign.id)}>Eliminar</Button>
                        <Button variant="primary" size="sm" onClick={() => handleLaunchCampaignClick(campaign.id)}>Lanzar</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No se encontraron campañas.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Col>
    </Container>
  );
};

export default Campaigns;