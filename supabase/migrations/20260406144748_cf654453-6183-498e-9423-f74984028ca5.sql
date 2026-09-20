-- Renomear labels dos módulos para numeração simples
-- Pessoa
UPDATE query_modules SET label = 'CPF 2' WHERE module_key = 'cpffull';
UPDATE query_modules SET label = 'CPF 3' WHERE module_key = 'cpf-isk';
UPDATE query_modules SET label = 'Nome 2' WHERE module_key = 'nomefull';
UPDATE query_modules SET label = 'Nome 3' WHERE module_key = 'nome-3';
UPDATE query_modules SET label = 'Mãe 2' WHERE module_key = 'maefull';
UPDATE query_modules SET label = 'Parentes 2' WHERE module_key = 'parentes-3';

-- Documentos
UPDATE query_modules SET label = 'PIS 2' WHERE module_key = 'pis-3';
UPDATE query_modules SET label = 'RG 2' WHERE module_key = 'rg-3';

-- Contato
UPDATE query_modules SET label = 'CEP 2' WHERE module_key = 'cepfull';
UPDATE query_modules SET label = 'CEP 3' WHERE module_key = 'cep-3';
UPDATE query_modules SET label = 'Email 2' WHERE module_key = 'emailfull';
UPDATE query_modules SET label = 'Email 3' WHERE module_key = 'email-3';
UPDATE query_modules SET label = 'Telefone 2' WHERE module_key = 'telefonefull';
UPDATE query_modules SET label = 'Telefone 3' WHERE module_key = 'telefone-3';

-- Financeiro
UPDATE query_modules SET label = 'Score 2' WHERE module_key = 'score-3';

-- Veículo
UPDATE query_modules SET label = 'Placa 2' WHERE module_key = 'placa-serpro';
UPDATE query_modules SET label = 'Placa 3' WHERE module_key = 'placa-simples';
UPDATE query_modules SET label = 'Placa 4' WHERE module_key = 'placa-sesp';