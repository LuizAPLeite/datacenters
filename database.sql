-- =============================================================
-- Mapa Mundial de Data Centers — esquema e dados
-- Imagens e logos: Wikimedia Commons (autor e licença em cada registro).
--
-- O arquivo não cria o banco, para funcionar também em hospedagens que
-- não permitem CREATE DATABASE (importe pelo phpMyAdmin com o banco selecionado).
--
-- Uso local (Laragon):
--   mysql -u root -e "CREATE DATABASE IF NOT EXISTS datacenters CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
--   mysql -u root --default-character-set=utf8mb4 datacenters < database.sql
-- =============================================================

-- Garante leitura em UTF-8 (no Windows o cliente mysql usa outro padrão)
SET NAMES utf8mb4;

DROP TABLE IF EXISTS datacenters;
DROP TABLE IF EXISTS empresas;

-- Empresas donas/operadoras dos data centers
CREATE TABLE empresas (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome          VARCHAR(120) NOT NULL,
  slug          VARCHAR(120) NOT NULL UNIQUE,
  site          VARCHAR(255) NULL,
  logo          VARCHAR(255) NULL COMMENT 'Caminho relativo, ex.: img/logos/google.svg',
  logo_autor    VARCHAR(255) NULL,
  logo_licenca  VARCHAR(120) NULL,
  logo_fonte    VARCHAR(255) NULL,
  cor           CHAR(7)      NOT NULL DEFAULT '#3b82f6' COMMENT 'Cor de destaque do pin',
  criado_em     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Data centers
CREATE TABLE datacenters (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  empresa_id         INT UNSIGNED  NOT NULL,
  nome               VARCHAR(160)  NOT NULL,
  cidade             VARCHAR(120)  NOT NULL,
  pais               VARCHAR(120)  NOT NULL,
  latitude           DECIMAL(9,6)  NOT NULL,
  longitude          DECIMAL(9,6)  NOT NULL,
  ano_inauguracao    SMALLINT      NULL,
  resumo             VARCHAR(500)  NOT NULL,
  historia           TEXT          NOT NULL,
  imagem_principal   VARCHAR(255)  NULL,
  imagem_legenda     VARCHAR(255)  NULL,
  imagem_autor       VARCHAR(255)  NULL,
  imagem_licenca     VARCHAR(120)  NULL,
  imagem_fonte       VARCHAR(255)  NULL,
  imagens            JSON          NULL COMMENT 'Lista de {arquivo, legenda, autor, licenca, fonte}',
  ativo              TINYINT(1)    NOT NULL DEFAULT 1,
  criado_em          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_dc_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_dc_pais (pais)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- Empresas
-- -------------------------------------------------------------
INSERT INTO empresas (id, nome, slug, site, logo, logo_autor, logo_licenca, logo_fonte, cor) VALUES
(1, 'Google', 'google', 'https://www.google.com/about/datacenters/', 'img/logos/google.svg', 'Google LLC', 'Domínio público', 'https://commons.wikimedia.org/wiki/File:Google_%22G%22_logo.svg', '#4285F4'),
(2, 'Meta', 'meta', 'https://datacenters.atmeta.com/', 'img/logos/meta.svg', 'Meta Platforms', 'Domínio público', 'https://commons.wikimedia.org/wiki/File:Meta_Platforms_Inc._logo_%28cropped%29.svg', '#0866FF'),
(3, 'Microsoft', 'microsoft', 'https://datacenters.microsoft.com/', 'img/logos/microsoft.svg', 'Microsoft', 'Domínio público', 'https://commons.wikimedia.org/wiki/File:Microsoft_logo.svg', '#00A4EF'),
(4, 'Amazon Web Services', 'aws', 'https://aws.amazon.com/about-aws/global-infrastructure/', 'img/logos/aws.svg', 'Amazon.com Inc.', 'Apache License 2.0', 'https://commons.wikimedia.org/wiki/File:Amazon_Web_Services_Logo.svg', '#FF9900'),
(5, 'Apple', 'apple', 'https://www.apple.com/environment/', 'img/logos/apple.svg', 'Rob Janoff (original)', 'Domínio público', 'https://commons.wikimedia.org/wiki/File:Apple_logo_black.svg', '#A2AAAD'),
(6, 'HostDime', 'hostdime', 'https://www.hostdime.com.br/', 'img/logos/hostdime.png', 'EditorTech20', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Logo_HostDime.png', '#F7941D'),
(7, 'Teraco', 'teraco', 'https://www.teraco.co.za/', 'img/logos/teraco.svg', 'Marcador provisório do projeto (logo oficial sem licença livre)', 'Uso interno', NULL, '#0EA5E9'),
(8, 'Equinix', 'equinix', 'https://www.equinix.com/', 'img/logos/equinix.png', 'Equinix', 'Domínio público', 'https://commons.wikimedia.org/wiki/File:Equinix_logo.svg', '#ED1C24'),
(9, 'NEXTDC', 'nextdc', 'https://www.nextdc.com/', 'img/logos/nextdc.svg', 'Marcador provisório do projeto (logo oficial sem licença livre)', 'Uso interno', NULL, '#16A34A');

-- -------------------------------------------------------------
-- Data centers (textos baseados em fontes públicas; posições de
-- regiões de nuvem são aproximadas, pois os endereços não são divulgados)
-- -------------------------------------------------------------
INSERT INTO datacenters
  (empresa_id, nome, cidade, pais, latitude, longitude, ano_inauguracao, resumo, historia,
   imagem_principal, imagem_legenda, imagem_autor, imagem_licenca, imagem_fonte, imagens)
VALUES
(1,
 'Google The Dalles',
 'The Dalles, Oregon',
 'Estados Unidos',
 45.632600,
 -121.201600,
 2006,
 'Primeiro data center projetado e construído pelo próprio Google, às margens do rio Columbia.',
 'Inaugurado em 2006, o campus de The Dalles foi o primeiro data center que o Google projetou e construiu inteiramente por conta própria. Até então, a empresa alugava espaço em instalações de terceiros. Durante a construção, o projeto foi cercado de sigilo.

A escolha da pequena cidade do Oregon não foi por acaso: a região é abastecida pela energia hidrelétrica barata das usinas do rio Columbia, como a represa de The Dalles, e tinha boa conectividade por fibra óptica. Clima seco e disponibilidade de terreno completaram a equação.

Ao longo dos anos o campus foi ampliado várias vezes, com novos prédios e investimentos bilionários. As grandes torres de resfriamento se tornaram a marca visual do local, e The Dalles ajudou a consolidar práticas que hoje são comuns na indústria, como servidores feitos sob medida e a medição rigorosa da eficiência energética (PUE).',
 'img/datacenters/dalles-1.jpg',
 'Prédios e torres de resfriamento do data center do Google em The Dalles (2011).',
 'Visitor7',
 'CC BY-SA 3.0',
 'https://commons.wikimedia.org/wiki/File:Google_Data_Center%2C_The_Dalles.jpg',
 '[{"arquivo":"img/datacenters/dalles-2.jpg","legenda":"Vista do campus de The Dalles, Oregon (2015).","autor":"Tony Webster","licenca":"CC BY 2.0","fonte":"https://commons.wikimedia.org/wiki/File:Google_Datacenter_-_The_Dalles%2C_Oregon_%2817832143871%29.jpg"}]'),

(1,
 'Google Council Bluffs',
 'Council Bluffs, Iowa',
 'Estados Unidos',
 41.221900,
 -95.860800,
 2009,
 'Um dos maiores campi do Google, no coração agrícola dos Estados Unidos.',
 'Os planos para o data center de Council Bluffs, no oeste do estado de Iowa, foram anunciados pelo Google em 2007, e as operações começaram em 2009. A cidade fica na divisa com o estado de Nebraska, em frente a Omaha, e oferecia terreno amplo, energia confiável e acesso a rotas de fibra óptica que cruzam o país.

O campus cresceu em várias etapas, com expansões anunciadas em 2012, 2015 e 2023. Somados, os investimentos do Google em Council Bluffs e arredores já passam de 5 bilhões de dólares, segundo reportagens de 2024, o que o torna um dos maiores complexos da empresa no mundo.

Iowa é também um dos estados americanos com maior geração de energia eólica, o que ajuda o Google em sua meta de abastecer suas operações com energia livre de carbono.',
 'img/datacenters/council-bluffs.jpg',
 'Vista aérea do data center do Google em Council Bluffs (2017).',
 'Chad Davis',
 'CC BY 2.0',
 'https://commons.wikimedia.org/wiki/File:Google_Data_Center%2C_Council_Bluffs_Iowa_%2849062863796%29.jpg',
 '[]'),

(2,
 'Meta Prineville',
 'Prineville, Oregon',
 'Estados Unidos',
 44.299000,
 -120.896000,
 2011,
 'Primeiro data center próprio do Facebook e berço do Open Compute Project.',
 'Inaugurado em abril de 2011, o data center de Prineville foi o primeiro construído pelo próprio Facebook (hoje Meta). Antes dele, a rede social funcionava em espaços alugados. O clima seco e de altitude do centro do Oregon permite resfriar os servidores quase sempre com ar externo e evaporação de água, sem grandes sistemas de ar-condicionado.

Junto com a inauguração, o Facebook publicou abertamente os projetos dos servidores, dos racks, das fontes de energia e do próprio prédio. Essa iniciativa deu origem ao Open Compute Project, comunidade que passou a compartilhar designs de hardware para data centers e influenciou empresas do mundo inteiro.

Na época, o primeiro prédio tinha cerca de 14 mil m², com previsão de dobrar de tamanho. Desde então o campus recebeu vários novos edifícios e se tornou um dos maiores da empresa.',
 'img/datacenters/prineville-1.jpg',
 'Prédios do data center da Meta às margens da Highway 126, a oeste de Prineville.',
 'Gary Halvorson, Oregon State Archives',
 'CC BY 4.0',
 'https://commons.wikimedia.org/wiki/File:Facebook%2C_Highway_126%2C_Prineville_-_DPLA_-_fd9c0cae95b43c5864c55d3eef1bf5a6.jpg',
 '[{"arquivo":"img/datacenters/prineville-2.jpg","legenda":"Fachada do data center de Prineville (2013).","autor":"Intel Free Press","licenca":"CC BY 2.0","fonte":"https://commons.wikimedia.org/wiki/File:Outside_Facebook_Data_Center.jpg"},{"arquivo":"img/datacenters/prineville-3.jpg","legenda":"Placas de servidor projetadas sob medida para Prineville, base do Open Compute Project.","autor":"Intel Free Press","licenca":"CC BY 2.0","fonte":"https://commons.wikimedia.org/wiki/File:Custom_Designed_Server_Boards.jpg"}]'),

(4,
 'AWS Norte da Virgínia (us-east-1)',
 'Ashburn, Virgínia',
 'Estados Unidos',
 39.043800,
 -77.487400,
 2006,
 'Região mais antiga da AWS, no maior polo de data centers do mundo.',
 'A região us-east-1, no norte da Virgínia, foi a primeira da Amazon Web Services. Foi nela que estrearam, em 2006, o Amazon S3 (armazenamento, em março) e o Amazon EC2 (servidores virtuais, em agosto), serviços que deram início à computação em nuvem como a conhecemos hoje.

Uma região da AWS não é um único prédio: ela é formada por várias zonas de disponibilidade, e cada zona reúne um ou mais data centers separados fisicamente, com energia e rede independentes. Por segurança, a AWS não divulga o endereço exato de suas instalações; a posição no mapa é aproximada.

O condado de Loudoun, onde fica Ashburn, é conhecido como "Data Center Alley". Desde os anos 1990 o norte da Virgínia é um ponto central da internet: a região abrigou o MAE-East, um dos primeiros grandes pontos de troca de tráfego, e a sede da AOL. Hoje concentra a maior quantidade de data centers do planeta.',
 'img/datacenters/ashburn-1.jpg',
 'Prédios de data center da AWS em Ashburn, Virgínia (2020).',
 'Vahurzpu',
 'CC BY-SA 4.0',
 'https://commons.wikimedia.org/wiki/File:AWS_servers_in_Ashburn%2C_group_1%2C_2020-10-09_1.jpg',
 '[{"arquivo":"img/datacenters/ashburn-2.jpg","legenda":"Vista aérea de data centers espalhados pelo condado de Loudoun, perto de Ashburn.","autor":"Theodore Christopher","licenca":"CC0","fonte":"https://commons.wikimedia.org/wiki/File:Data_centers_in_Ashburn.jpg"}]'),

(1,
 'Google Quilicura',
 'Quilicura, Santiago',
 'Chile',
 -33.360000,
 -70.730000,
 2015,
 'Primeiro data center do Google na América Latina, abastecido por energia solar.',
 'O Google anunciou em 2012 a construção de um data center em Quilicura, comuna da região metropolitana de Santiago. A instalação entrou em plena operação em janeiro de 2015 e foi o primeiro data center da empresa na América Latina. Segundo executivos do Google, o Chile foi escolhido entre vários países pelo ambiente favorável a investimentos estrangeiros e pela boa infraestrutura.

O data center atende usuários de toda a região com serviços como Busca, Gmail e YouTube. O Google firmou contratos para abastecê-lo com energia solar de uma usina no deserto do Atacama, aproveitando um dos lugares com maior incidência de sol do planeta.

Em 2018 a empresa anunciou um investimento adicional de 140 milhões de dólares para triplicar o tamanho do campus, e estima que o investimento total no local supere 290 milhões de dólares.',
 'img/datacenters/quilicura.jpg',
 'Vista aérea da comuna de Quilicura, onde fica o data center. Não há foto do prédio com licença livre.',
 'WeHaKa',
 'CC BY-SA 4.0',
 'https://commons.wikimedia.org/wiki/File:Quilicura_y_cerro_Renca.jpg',
 '[]'),

(4,
 'AWS São Paulo (sa-east-1)',
 'São Paulo',
 'Brasil',
 -23.550500,
 -46.633300,
 2011,
 'Primeira região da AWS na América do Sul, inaugurada em dezembro de 2011.',
 'Em 14 de dezembro de 2011, a Amazon Web Services inaugurou a região América do Sul (São Paulo), identificada como sa-east-1. Foi a oitava região da AWS no mundo e a primeira no continente sul-americano.

Antes dela, empresas brasileiras que usavam a AWS precisavam hospedar seus sistemas nos Estados Unidos, o que aumentava o tempo de resposta (latência) e dificultava o cumprimento de exigências legais sobre onde os dados ficam armazenados. Com a região em São Paulo, bancos, varejistas, startups e órgãos públicos passaram a ter a nuvem da AWS perto de seus clientes.

Como nas demais regiões, a infraestrutura é distribuída em várias zonas de disponibilidade com data centers independentes. A AWS não divulga os endereços, por isso a posição no mapa é aproximada.',
 'img/datacenters/sao-paulo.jpg',
 'Vista aérea de São Paulo. A AWS não divulga a localização exata de seus data centers.',
 'Spicypepper999',
 'CC0',
 'https://commons.wikimedia.org/wiki/File:Sao_Paulo_Brazil_Skyline_Aerial%2C_December_2024.jpg',
 '[]'),

(6,
 'HostDime João Pessoa',
 'João Pessoa, Paraíba',
 'Brasil',
 -7.119500,
 -34.845000,
 2017,
 'Data center no Nordeste brasileiro com certificação Tier III e energia solar.',
 'A HostDime, empresa de hospedagem fundada nos Estados Unidos, inaugurou oficialmente seu data center em João Pessoa (PB) em 14 de julho de 2017. A localização no Nordeste fica relativamente perto de Fortaleza, um dos principais pontos de chegada de cabos submarinos de internet do Brasil, e permite atender o mercado regional com baixa latência.

O data center recebeu do Uptime Institute a certificação Tier III, que indica que qualquer componente pode passar por manutenção sem interromper o funcionamento. A empresa também anunciou que a instalação passaria a ser abastecida integralmente por energia solar.

A HostDime anunciou ainda um investimento de cerca de 40 milhões de dólares em um novo data center em João Pessoa, projetado para obter a certificação Tier IV, o nível mais alto de tolerância a falhas.',
 'img/datacenters/joao-pessoa.jpg',
 'Fachada do data center da HostDime em João Pessoa (2017).',
 'HostDime Brasil',
 'CC BY-SA 4.0',
 'https://commons.wikimedia.org/wiki/File:Data_Center_HostDime.jpg',
 '[]'),

(2,
 'Meta Luleå',
 'Luleå',
 'Suécia',
 65.610000,
 22.130000,
 2013,
 'Primeiro data center da Meta fora dos EUA, perto do Círculo Polar Ártico.',
 'Anunciado em outubro de 2011 e inaugurado em junho de 2013, o data center de Luleå, no norte da Suécia, foi o primeiro do Facebook (hoje Meta) fora dos Estados Unidos. A cidade fica a pouco mais de 100 km do Círculo Polar Ártico.

O frio da região é aproveitado para resfriar os servidores com ar externo durante quase todo o ano, e o calor gerado pelas máquinas é reaproveitado para aquecer os escritórios. A energia vem de usinas hidrelétricas do rio Lule, e a rede elétrica local é tão estável que a empresa reduziu em mais de 70% a quantidade de geradores de reserva.

Na inauguração, Luleå era a única instalação da empresa que usava exclusivamente servidores projetados pela própria Meta, seguindo os padrões do Open Compute Project.',
 'img/datacenters/lulea.jpg',
 'Prédio do data center da Meta em Luleå (2016).',
 'Christopher Down',
 'CC BY 4.0',
 'https://commons.wikimedia.org/wiki/File:Lulea_Facebook_datacenter_building.jpg',
 '[]'),

(1,
 'Google Hamina',
 'Hamina',
 'Finlândia',
 60.542000,
 27.115000,
 2011,
 'Antiga fábrica de papel transformada em data center resfriado com água do mar.',
 'Em março de 2009, o Google comprou da empresa finlandesa Stora Enso a fábrica de papel de Summa, em Hamina, que havia sido fechada em 2008 pela queda na demanda por papel. O prédio foi convertido em data center, e a primeira fase entrou em operação em setembro de 2011.

O grande diferencial de Hamina é o resfriamento com água do mar: um túnel construído para a fábrica de papel nos anos 1950 traz água fria do Golfo da Finlândia até o sistema de refrigeração.

Desde então o Google fez novos investimentos no local, que já somam mais de 1 bilhão de dólares, transformando a antiga cidade industrial em um importante polo tecnológico da Finlândia.',
 'img/datacenters/hamina.jpg',
 'Data center do Google na área da antiga fábrica de papel de Summa, em Hamina (2016).',
 'IA',
 'CC BY-SA 4.0',
 'https://commons.wikimedia.org/wiki/File:Googlen_palvelinkeskus_Hamina_1.jpg',
 '[]'),

(5,
 'Apple Viborg',
 'Foulum, Viborg',
 'Dinamarca',
 56.494000,
 9.578000,
 2020,
 'Data center da Apple abastecido 100% por energia renovável.',
 'Em fevereiro de 2015, a Apple anunciou um investimento de 1,7 bilhão de euros para construir dois data centers na Europa: um em Viborg, na Dinamarca, e outro em Athenry, na Irlanda. O projeto irlandês acabou abandonado após anos de disputas judiciais, mas o dinamarquês seguiu adiante. Ele fica em Foulum, perto de Viborg, e entrou em operação em 2020, após cerca de quatro anos de obras.

O data center funciona com energia 100% renovável. Para isso, a Apple construiu na Dinamarca um dos maiores parques solares da Escandinávia, além de investir em energia eólica. A instalação atende serviços como iCloud, App Store, iMessage e Siri para usuários europeus.

O projeto também prevê enviar o calor gerado pelos servidores para o sistema de aquecimento urbano de Viborg. Em reportagens de 2022, porém, essa conexão ainda não estava funcionando.',
 'img/datacenters/viborg.jpg',
 'Obras do data center da Apple em Foulum, vistas em panorama (2016).',
 'Finn Årup Nielsen',
 'CC BY-SA 4.0',
 'https://commons.wikimedia.org/wiki/File:Foulum_datacenter%2C_panorama_mod_%C3%B8st%2C_2016-10-01.jpg',
 '[]'),

(3,
 'Microsoft Dublin',
 'Grange Castle, Dublin',
 'Irlanda',
 53.317000,
 -6.438000,
 2009,
 'Primeiro "mega data center" da Microsoft fora dos EUA, resfriado pelo ar irlandês.',
 'Inaugurado em 2009 no parque empresarial de Grange Castle, perto de Clondalkin, no oeste de Dublin, este foi o primeiro grande data center da Microsoft fora dos Estados Unidos. O investimento inicial foi de cerca de 500 milhões de dólares (341 milhões de euros), em um prédio de dois andares com cerca de 28 mil m².

O clima ameno da Irlanda permite resfriar os servidores com ar externo em mais de 95% do tempo, sem uso de ar-condicionado mecânico. Em reformas posteriores a Microsoft eliminou sistemas de reserva e de resfriamento evaporativo, de modo que o prédio passou a não usar água para refrigeração.

O campus de Dublin cresceu muito desde então e se tornou um dos principais pontos da nuvem Azure e de serviços como o Microsoft 365 na Europa.',
 'img/datacenters/dublin.jpg',
 'Ponte sobre o Grand Canal em Clondalkin, bairro vizinho ao campus. Não há foto do data center com licença livre.',
 'JP',
 'CC BY-SA 2.0',
 'https://commons.wikimedia.org/wiki/File:Clondalkin_Bridge_on_the_Grand_Canal%2C_Dublin_22_-_geograph.org.uk_-_1371773.jpg',
 '[]'),

(7,
 'Teraco JB1 Isando',
 'Isando, Joanesburgo',
 'África do Sul',
 -26.144000,
 28.205000,
 2010,
 'Um dos maiores data centers neutros da África, onde funciona o NAPAfrica.',
 'A Teraco inaugurou o data center JB1, em Isando, região metropolitana de Joanesburgo, em janeiro de 2010, um ano depois de sua instalação na Cidade do Cabo entrar em operação. O local foi escolhido porque a maior parte dos anéis de fibra óptica das operadoras sul-africanas passa por ali.

O JB1 é um data center "neutro": ele não pertence a nenhuma operadora de telecomunicações, o que permite que empresas e provedores concorrentes se conectem diretamente uns aos outros. É no campus de Isando que funciona o NAPAfrica, ponto de troca de tráfego mantido pela Teraco e um dos maiores do continente.

A primeira fase tinha cerca de 1.250 m². Com a demanda crescente, o campus foi ampliado várias vezes, com os prédios JB1 East e JB1 West. Em 2018 a empresa anunciou mais 1 bilhão de rands em expansões, elevando a capacidade para cerca de 5.700 racks.',
 'img/datacenters/isando.jpg',
 'Campus da Teraco em Isando, Joanesburgo (2025).',
 'Ossewa',
 'CC BY-SA 4.0',
 'https://commons.wikimedia.org/wiki/File:Isando_data_centre.jpg',
 '[]'),

(4,
 'AWS Cidade do Cabo (af-south-1)',
 'Cidade do Cabo',
 'África do Sul',
 -33.924900,
 18.424100,
 2020,
 'Primeira região da AWS na África, aberta em abril de 2020.',
 'A região África (Cidade do Cabo), identificada como af-south-1, foi aberta pela Amazon Web Services em 22 de abril de 2020. Foi a 23ª região da AWS e a primeira no continente africano, começando com três zonas de disponibilidade.

A escolha da Cidade do Cabo tem raízes antigas: a Amazon mantém um centro de desenvolvimento na cidade desde 2004, e foi uma equipe baseada ali que ajudou a criar o Amazon EC2, um dos serviços fundadores da AWS.

A chegada da região acirrou a disputa pela nuvem na África: a Microsoft havia aberto suas regiões do Azure em Joanesburgo e na Cidade do Cabo em 2019. A AWS não divulga a localização exata dos data centers, por isso a posição no mapa é aproximada.',
 'img/datacenters/cape-town.jpg',
 'Centro da Cidade do Cabo e a Montanha da Mesa. A AWS não divulga a localização exata de seus data centers.',
 'Daniel Case',
 'CC BY-SA 3.0',
 'https://commons.wikimedia.org/wiki/File:Cape_Town_City_Bowl_and_Table_Mountain_at_dawn.jpg',
 '[]'),

(8,
 'Equinix LG1 (antigo MDXi Lekki)',
 'Lekki, Lagos',
 'Nigéria',
 6.447400,
 3.472300,
 2015,
 'Primeiro data center com certificação Tier III da África Ocidental.',
 'O data center de Lekki foi construído pela MainOne, empresa nigeriana fundada pela engenheira Funke Opeke, que em 2010 havia lançado um cabo submarino ligando Portugal à costa oeste da África. Lançado em janeiro de 2015 com a marca MDXi, ele foi apresentado como o primeiro data center da África Ocidental com certificação Tier III do Uptime Institute.

Lagos é o maior centro econômico da Nigéria, e o data center permitiu que bancos, operadoras e empresas de tecnologia hospedassem seus sistemas no próprio país, perto do cabo submarino da MainOne. Em 2022 foi inaugurada uma segunda fase, Lekki II, e o campus foi planejado para chegar a 10 MW.

A americana Equinix comprou a MainOne por cerca de 320 milhões de dólares, em negócio anunciado no fim de 2021 e concluído em 2022. Em outubro de 2024 a marca MDXi foi aposentada, e a instalação passou a se chamar Equinix LG1.',
 'img/datacenters/lagos.jpg',
 'Ponte Lekki-Ikoyi à noite, em Lagos. Não há foto do data center com licença livre.',
 'Olasunkanmiariyo',
 'CC BY-SA 4.0',
 'https://commons.wikimedia.org/wiki/File:Lekki_link_bridge_at_night.jpg',
 '[]'),

(1,
 'Google Changhua',
 'Xianxi, Changhua',
 'Taiwan',
 24.135000,
 120.430000,
 2013,
 'Um dos dois primeiros data centers do Google na Ásia, com armazenamento térmico de frio.',
 'Em 11 de dezembro de 2013, o Google inaugurou ao mesmo tempo seus dois primeiros data centers na Ásia: um em Singapura e outro no Parque Industrial Costeiro de Changhua, no município de Xianxi, em Taiwan. A empresa também planejava um centro em Hong Kong, mas desistiu por dificuldades para adquirir o terreno.

O campus de Changhua ocupa cerca de 15 hectares, cercado por turbinas eólicas de cerca de 100 metros de altura, e teve investimento planejado de 600 milhões de dólares. Uma de suas inovações é o armazenamento térmico: durante a noite, quando a energia é mais barata e o ar mais fresco, a água é resfriada e guardada em grandes tanques isolados; durante o dia, essa água fria é usada para resfriar os servidores.

O local cresceu bastante desde a inauguração e se tornou um dos centros mais importantes do Google para atender usuários na Ásia.',
 'img/datacenters/changhua-1.jpg',
 'Portão principal do data center do Google em Xianxi, Changhua (2021).',
 'Kai3952',
 'CC BY-SA 4.0',
 'https://commons.wikimedia.org/wiki/File:Exterior_view_of_the_main_gate%2C_Google%27s_Taiwan_data_center_in_Xianxi%2C_Changhua%2C_as_taken_on_7_March_2021.jpg',
 '[{"arquivo":"img/datacenters/changhua-2.jpg","legenda":"Cerimônia de inauguração do data center de Taiwan (dezembro de 2013).","autor":"Governo do Condado de Changhua","licenca":"Atribuição","fonte":"https://commons.wikimedia.org/wiki/File:Google%E5%8F%B0%E7%81%A3%E8%B3%87%E6%96%99%E4%B8%AD%E5%BF%83%E5%95%9F%E7%94%A8%E5%85%B8%E7%A6%AE.jpg"},{"arquivo":"img/datacenters/changhua-3.jpg","legenda":"Sala de convivência dos funcionários dentro do data center (2013).","autor":"Governo do Condado de Changhua","licenca":"Atribuição","fonte":"https://commons.wikimedia.org/wiki/File:Google%E5%8F%B0%E7%81%A3%E8%B3%87%E6%96%99%E4%B8%AD%E5%BF%83%E5%85%A7%E9%83%A8.jpg"}]'),

(1,
 'Google Singapura',
 'Jurong West',
 'Singapura',
 1.340400,
 103.709000,
 2013,
 'O primeiro data center de vários andares construído pelo Google.',
 'Inaugurado em 11 de dezembro de 2013, no mesmo dia que o centro de Taiwan, o data center de Jurong West foi um dos dois primeiros do Google na Ásia. Ele foi construído para atender o rápido crescimento do uso da internet no Sudeste Asiático.

Como o terreno em Singapura é escasso e caro, o Google fez algo inédito: em vez de espalhar o prédio horizontalmente, como em seus outros campi, construiu seu primeiro data center de dois andares, empilhando os servidores para ocupar uma área bem menor, de cerca de 2,5 hectares.

Nos anos seguintes a empresa ampliou sua presença na cidade-Estado com novos prédios, mantendo Singapura como um dos principais pontos de sua infraestrutura na região.',
 'img/datacenters/singapore.jpg',
 'Centro financeiro de Singapura à noite. Não há foto do data center com licença livre.',
 'Basile Morin',
 'CC BY-SA 4.0',
 'https://commons.wikimedia.org/wiki/File:Skyline_of_the_Central_Business_District_of_Singapore_with_Esplanade_Bridge.jpg',
 '[]'),

(4,
 'AWS Tóquio (ap-northeast-1)',
 'Tóquio',
 'Japão',
 35.676200,
 139.650300,
 2011,
 'Segunda região da AWS na Ásia, aberta em março de 2011.',
 'A região Ásia-Pacífico (Tóquio), identificada como ap-northeast-1, foi aberta pela Amazon Web Services em 2 de março de 2011. Foi a segunda região da empresa na Ásia, depois de Singapura (2010), e passou a atender o Japão, um dos maiores mercados de tecnologia do mundo.

Com a região, empresas japonesas puderam rodar seus sistemas na nuvem da AWS dentro do próprio país, com menor latência e respeitando regras locais de proteção de dados. Ao longo dos anos ela se tornou uma das maiores regiões da AWS, com várias zonas de disponibilidade.

Mais tarde a AWS abriu também uma região em Osaka, que funciona como alternativa a Tóquio em caso de desastres naturais. Os endereços dos data centers não são divulgados, por isso a posição no mapa é aproximada.',
 'img/datacenters/tokyo.jpg',
 'Vista de Tóquio a partir da Tokyo Skytree. A AWS não divulga a localização exata de seus data centers.',
 'Ruthsic',
 'CC BY-SA 4.0',
 'https://commons.wikimedia.org/wiki/File:Tokyo_skyline_seen_from_Tokyo_Skytree.jpg',
 '[]'),

(9,
 'NEXTDC P2 Perth',
 'Perth, Austrália Ocidental',
 'Austrália',
 -31.945000,
 115.857000,
 2020,
 'Data center com certificação Tier IV no centro de Perth.',
 'A NEXTDC, empresa australiana de data centers, inaugurou o P2 no centro de Perth em agosto de 2020. A obra foi concluída em julho daquele ano pela construtora Multiplex. O P2 complementa o P1, que a empresa já operava no bairro de Malaga, e os dois são interligados por conexões de fibra dedicadas.

O prédio foi projetado para chegar a 20 MW de capacidade de TI e cerca de 12 mil m² de área técnica, embora tenha começado com apenas 1 MW. Ele recebeu a certificação Tier IV do Uptime Institute, o nível mais alto de tolerância a falhas, em que a instalação continua funcionando mesmo diante de uma pane em qualquer componente.

Perth é a capital mais isolada da Austrália, e o P2 ajuda empresas da Austrália Ocidental, como mineradoras e órgãos públicos, a manter seus dados perto de casa.',
 'img/datacenters/perth.jpg',
 'Data center P2 da NEXTDC, em Perth (2021).',
 'Samuel Wiki',
 'CC0',
 'https://commons.wikimedia.org/wiki/File:NEXTDC_P2%2C_Perth.jpg',
 '[]'),

(4,
 'AWS Sydney (ap-southeast-2)',
 'Sydney',
 'Austrália',
 -33.868800,
 151.209300,
 2012,
 'Primeira região da AWS na Oceania, aberta em novembro de 2012.',
 'A região Ásia-Pacífico (Sydney), identificada como ap-southeast-2, foi anunciada pela Amazon Web Services em 12 de novembro de 2012. Foi a nona região da AWS no mundo, a terceira na Ásia-Pacífico (depois de Singapura e Tóquio) e a primeira na Oceania. Começou com duas zonas de disponibilidade.

Até então, empresas australianas precisavam usar servidores em outros países, o que aumentava a latência e preocupava setores como bancos e governo, que exigem que certos dados fiquem no território nacional. A região de Sydney resolveu esse problema e acelerou a adoção da nuvem no país.

Como nas outras regiões, a AWS não divulga os endereços dos data centers; a posição no mapa é aproximada.',
 'img/datacenters/sydney.jpg',
 'Panorama de Sydney. A AWS não divulga a localização exata de seus data centers.',
 'Dietmar Rabich',
 'CC BY-SA 4.0',
 'https://commons.wikimedia.org/wiki/File:Sydney_%28AU%29%2C_Skyline_--_2019_--_2287.jpg',
 '[]');
