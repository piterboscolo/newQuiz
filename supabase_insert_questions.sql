-- ============================================
-- INSERIR QUESTÕES INICIAIS
-- ============================================
-- Execute este script APÓS executar o supabase_schema.sql
-- Este script insere as questões padrão do mockData.ts

-- Matemática
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('1', '1', 'Quanto é 2 + 2?', '["3", "4", "5", "6"]'::jsonb, 1, 'O número 4 é considerado um número perfeito em várias culturas e aparece frequentemente na natureza, como nas 4 estações do ano e nos 4 pontos cardeais.'),
  ('2', '1', 'Quanto é 5 × 3?', '["10", "15", "20", "25"]'::jsonb, 1, 'A multiplicação é uma forma rápida de fazer adições repetidas. 5 × 3 é o mesmo que 5 + 5 + 5. A tabuada foi criada para facilitar cálculos mentais!')
ON CONFLICT (id) DO NOTHING;

-- Português - Locução Adjetiva
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('100', '2', 'Qual é a locução adjetiva na frase: "A casa de pedra é antiga"?', '["casa antiga", "de pedra", "é antiga", "a casa"]'::jsonb, 1, 'Locução adjetiva é uma expressão formada por preposição + substantivo que funciona como adjetivo.'),
  ('101', '2', 'Qual alternativa contém uma locução adjetiva?', '["casa bonita", "cachorro feroz", "pássaro cantador", "copo de vidro"]'::jsonb, 3, 'Locuções adjetivas são muito usadas no dia a dia para descrever características dos objetos.'),
  ('102', '2', 'Qual é o adjetivo correspondente à locução "de ouro"?', '["dourado", "prateado", "bronzeado", "prateado"]'::jsonb, 0, 'Muitas joias são feitas de ouro, que é um metal precioso.'),
  ('103', '2', 'Qual é a locução adjetiva que equivale a "ferroviário"?', '["de trem", "de ferro", "de estrada", "de carro"]'::jsonb, 0, 'As primeiras estradas de ferro no Brasil foram construídas no século XIX.'),
  ('104', '2', 'Qual alternativa NÃO contém uma locução adjetiva?', '["copo de plástico", "cadeira de madeira", "casa bonita", "anel de prata"]'::jsonb, 2, 'As locuções adjetivas geralmente são formadas por preposição + substantivo.')
ON CONFLICT (id) DO NOTHING;

-- Português - Adjetivos
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('105', '2', 'Qual palavra é um adjetivo na frase: "O gato preto pulou o muro alto"?', '["gato", "preto", "pulou", "muro"]'::jsonb, 1, 'Os adjetivos podem variar em gênero (masculino/feminino) e número (singular/plural).'),
  ('106', '2', 'Qual alternativa contém apenas adjetivos?', '["rápido, lento, feliz", "correr, pular, nadar", "casa, escola, parque", "eu, ele, nós, vocês"]'::jsonb, 0, 'Os adjetivos são palavras que caracterizam os substantivos.'),
  ('107', '2', 'Qual é o grau superlativo de "feliz"?', '["felizão", "muito feliz", "felizinho", "felizardos"]'::jsonb, 1, 'O superlativo pode ser de superioridade (muito feliz) ou de inferioridade (pouco feliz).'),
  ('108', '2', 'Qual alternativa contém um adjetivo no grau aumentativo?', '["carrão", "casinha", "florzinha", "livreto"]'::jsonb, 0, 'O aumentativo pode indicar tamanho grande ou ser usado de forma afetiva.'),
  ('109', '2', 'Qual é o feminino de "ator"?', '["atora", "atriz", "atrizes", "atores"]'::jsonb, 1, 'Muitas profissões têm formas diferentes para o masculino e feminino em português.')
ON CONFLICT (id) DO NOTHING;

-- Português - Adjetivos Pátrios
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('110', '2', 'Qual é o adjetivo pátrio de quem nasce na França?', '["francês", "francense", "francano", "francino"]'::jsonb, 0, 'Os adjetivos pátrios também são conhecidos como gentílicos.'),
  ('111', '2', 'Qual é o adjetivo pátrio de quem nasce em Portugal?', '["português", "portugalense", "portugalês", "portugano"]'::jsonb, 0, 'O português é a língua oficial de Portugal, Brasil e mais 7 países.'),
  ('112', '2', 'Qual é o adjetivo pátrio de quem nasce no Rio de Janeiro?', '["carioca", "fluminense", "rio-janeirense", "rio-grandense"]'::jsonb, 1, 'O termo "fluminense" vem do latim "flumen", que significa rio.'),
  ('113', '2', 'Qual é o adjetivo pátrio de quem nasce em São Paulo (capital)?', '["paulista", "paulistano", "são-paulino", "são-paulense"]'::jsonb, 1, 'São Paulo é a maior cidade do Brasil e uma das maiores do mundo!'),
  ('114', '2', 'Qual é o adjetivo pátrio de quem nasce na Bahia?', '["baiano", "baiense", "baiano/a", "baianense"]'::jsonb, 0, 'A Bahia foi o primeiro local onde os portugueses chegaram no Brasil em 1500.')
ON CONFLICT (id) DO NOTHING;

-- Português - Substantivos uniformes
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('115', '2', 'Qual destas palavras é um substantivo sobrecomum?', '["a criança", "o artista", "a vítima", "o estudante"]'::jsonb, 2, 'Substantivos sobrecomuns têm uma única forma para os dois gêneros.'),
  ('116', '2', 'Qual destas palavras é um substantivo comum de dois gêneros?', '["o artista/a artista", "o/a estudante", "a vítima", "o jacaré/a jacaré"]'::jsonb, 1, 'Muitas profissões modernas usam substantivos comuns de dois gêneros.'),
  ('117', '2', 'Qual destas palavras é um substantivo epiceno?', '["o aluno/a aluna", "o jacaré", "o/a estudante", "a criança"]'::jsonb, 1, 'Muitos nomes de animais são substantivos epicenos, como "a cobra" e "o tigre".'),
  ('118', '2', 'Qual alternativa contém um substantivo comum de dois gêneros?', '["o menino/a menina", "o intérprete/a intérprete", "o leão/a leoa", "o ator/a atriz"]'::jsonb, 1, 'Muitas profissões terminadas em "e" são comuns de dois gêneros.'),
  ('119', '2', 'Qual destas palavras NÃO é um substantivo sobrecomum?', '["a pessoa", "o cônjuge", "a testemunha", "o professor"]'::jsonb, 3, 'Substantivos sobrecomuns não variam em gênero, como "a pessoa" e "o cônjuge".')
ON CONFLICT (id) DO NOTHING;

-- Português - Diminutivo e aumentativo
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('120', '2', 'Qual é o diminutivo de "cão"?', '["cãozinho", "cãozito", "cãzinho", "cãozão"]'::jsonb, 0, 'Em português, os sufixos mais comuns para formar o diminutivo são "-inho" e "-zinho".'),
  ('121', '2', 'Qual é o aumentativo de "casa"?', '["casão", "casinha", "casebre", "casota"]'::jsonb, 0, 'O aumentativo pode indicar tamanho grande ou ser usado para expressar afeto ou desprezo.'),
  ('122', '2', 'Qual destas palavras está no grau diminutivo?', '["carrão", "livrão", "florzinha", "casaço"]'::jsonb, 2, 'O sufixo "-zinho" é o mais usado para formar diminutivos em português.'),
  ('123', '2', 'Qual é o aumentativo de "homem"?', '["homenzarrão", "homemzão", "homemão", "homenzarrão"]'::jsonb, 0, 'Algumas palavras têm formas irregulares de aumentativo.'),
  ('124', '2', 'Qual alternativa contém um diminutivo afetivo?', '["carrão", "florzinha", "casota", "livrão"]'::jsonb, 1, 'Os diminutivos são muito usados no português para expressar afeto ou diminuição de tamanho.')
ON CONFLICT (id) DO NOTHING;

-- Português - Singular e plural
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('125', '2', 'Qual é o plural de "pão"?', '["pães", "pãos", "pãoes", "pãos"]'::jsonb, 0, 'Palavras terminadas em "-ão" podem formar o plural de três maneiras: -ães, -ãos ou -ões.'),
  ('126', '2', 'Qual é o plural de "mão"?', '["mãos", "mães", "mões", "mãs"]'::jsonb, 0, '"Mão" é uma palavra que vem do latim "manus" e mantém uma forma irregular no plural.'),
  ('127', '2', 'Qual é o plural de "cidadão"?', '["cidadãos", "cidadães", "cidadões", "cidadãs"]'::jsonb, 0, 'As palavras terminadas em "-ão" geralmente formam o plural com "-ãos", "-ães" ou "-ões".'),
  ('128', '2', 'Qual é o plural de "cão"?', '["cães", "cãos", "cães/cãos", "cãs"]'::jsonb, 0, 'A forma "cães" é a mais comum, mas "cãos" também é aceita, embora menos usada.'),
  ('129', '2', 'Qual é o plural de "avião"?', '["aviões", "aviães", "aviãos", "aviãs"]'::jsonb, 0, 'A maioria das palavras terminadas em "-ão" forma o plural com "-ões".')
ON CONFLICT (id) DO NOTHING;

-- Português - Sufixos -eza e -esa
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('130', '2', 'Qual palavra é formada pelo sufixo "-eza"?', '["beleza", "natureza", "riqueza", "todas as alternativas"]'::jsonb, 3, 'O sufixo "-eza" é usado para formar substantivos que indicam qualidade ou estado.'),
  ('131', '2', 'Qual palavra NÃO é formada pelo sufixo "-eza"?', '["beleza", "riqueza", "natureza", "pobreza"]'::jsonb, 2, '"Natureza" não é formada por sufixo, é uma palavra primitiva.'),
  ('132', '2', 'Qual palavra é formada pelo sufixo "-esa"?', '["princesa", "condessa", "duquesa", "todas as alternativas"]'::jsonb, 3, 'O sufixo "-esa" é usado para formar o feminino de algumas profissões ou títulos nobres.'),
  ('133', '2', 'Qual é o feminino de "conde"?', '["condessa", "condesa", "conda", "condesa"]'::jsonb, 0, 'Algumas palavras têm formas irregulares para o feminino em português.'),
  ('134', '2', 'Qual destas palavras NÃO é formada por sufixo?', '["beleza", "pobreza", "natureza", "riqueza"]'::jsonb, 2, 'É importante distinguir entre palavras primitivas e palavras derivadas em português.')
ON CONFLICT (id) DO NOTHING;

-- Português - Gênero do substantivo
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('135', '2', 'Qual é o feminino de "ator"?', '["atora", "atriz", "atores", "atrizes"]'::jsonb, 1, 'Algumas profissões têm formas diferentes para o masculino e feminino em português.'),
  ('136', '2', 'Qual é o masculino de "dona"?', '["dono", "dom", "senhor", "dono/donato"]'::jsonb, 0, '"Dona" é usado como título de tratamento para mulheres, assim como "Dom" para homens em alguns contextos.'),
  ('137', '2', 'Qual destas palavras é do gênero masculino?', '["caneta", "lápis", "mesa", "cadeira"]'::jsonb, 1, 'Em português, os substantivos podem ser masculinos ou femininos.'),
  ('138', '2', 'Qual é o feminino de "poeta"?', '["poetisa", "poeta", "poetiza", "poetisa/poeta"]'::jsonb, 3, 'Algumas profissões têm formas específicas para o feminino, enquanto outras são comuns de dois gêneros.'),
  ('139', '2', 'Qual destas palavras é do gênero feminino?', '["mapa", "dia", "foto", "cinema"]'::jsonb, 2, 'Apesar de terminar em "o", "foto" é uma palavra feminina porque é uma abreviação de "fotografia".')
ON CONFLICT (id) DO NOTHING;

-- Português - Substantivos primitivos e derivados
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('140', '2', 'Qual palavra é primitiva em relação às outras?', '["livro", "livraria", "livreto", "livrinho"]'::jsonb, 0, 'Palavras primitivas são aquelas que não derivam de outras palavras da língua.'),
  ('141', '2', 'Qual palavra é derivada de "mar"?', '["marinho", "maré", "marítimo", "todas as alternativas"]'::jsonb, 3, 'Uma palavra primitiva pode dar origem a várias palavras derivadas.'),
  ('142', '2', 'Qual destas palavras é primitiva?', '["casa", "casebre", "caseiro", "casinha"]'::jsonb, 0, 'As palavras derivadas são formadas a partir de palavras primitivas por meio de prefixos, sufixos ou ambos.'),
  ('143', '2', 'Qual palavra NÃO é derivada de "água"?', '["aguaceiro", "águia", "aguado", "aguardente"]'::jsonb, 1, 'Nem todas as palavras que começam com "agu" são derivadas de "água".'),
  ('144', '2', 'Qual palavra é derivada de "paz"?', '["pazada", "pazento", "pazada", "paz"]'::jsonb, 1, 'O sufixo "-ento" pode indicar posse de uma qualidade.')
ON CONFLICT (id) DO NOTHING;

-- Português - Singular, plural e plural do diminutivo
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('145', '2', 'Qual é o plural de "carrinho"?', '["carrinhos", "carriões", "carriços", "carrinhas"]'::jsonb, 0, 'Os diminutivos em "-inho" formam o plural trocando o "-o" final por "-os".'),
  ('146', '2', 'Qual é o plural de "florzinha"?', '["florzinhas", "floreszinhas", "florinhas", "florzinhas"]'::jsonb, 0, 'Os diminutivos em "-zinha" formam o plural trocando o "-a" final por "-as".'),
  ('147', '2', 'Qual é o plural de "cãozinho"?', '["cãeszinhos", "cãzinhos", "cãozinhos", "cãeszinhos"]'::jsonb, 2, 'O plural dos diminutivos em "-zinho" segue a regra geral de formação de plural em português.'),
  ('148', '2', 'Qual é o plural de "livrinho"?', '["livrinhos", "livrozinhos", "livrões", "livretos"]'::jsonb, 0, 'O sufixo "-inho" é um dos mais produtivos na formação de diminutivos em português.'),
  ('149', '2', 'Qual é o plural de "copinho"?', '["copinhos", "copinhas", "copões", "copinhos"]'::jsonb, 0, 'Os diminutivos em "-inho" são muito usados no português para expressar afeto ou tamanho reduzido.')
ON CONFLICT (id) DO NOTHING;

-- Português - Substantivo composto e substantivo simples
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('150', '2', 'Qual destas palavras é um substantivo composto?', '["guarda-chuva", "casa", "livro", "cadeira"]'::jsonb, 0, 'Os substantivos compostos são formados por mais de um radical.'),
  ('151', '2', 'Qual destas palavras é um substantivo simples?', '["pé-de-moleque", "guarda-roupa", "cachorro-quente", "livro"]'::jsonb, 3, 'Substantivos simples são formados por apenas um elemento mórfico.'),
  ('152', '2', 'Qual destas palavras é um substantivo composto por verbo + substantivo?', '["guarda-chuva", "couve-flor", "pé-de-moleque", "passatempo"]'::jsonb, 0, 'Muitos substantivos compostos em português são formados por verbo + substantivo.'),
  ('153', '2', 'Qual destas palavras é um substantivo composto por substantivo + adjetivo?', '["couve-flor", "guarda-chuva", "pé-de-moleque", "passatempo"]'::jsonb, 0, 'Em "couve-flor", "flor" funciona como adjetivo, descrevendo o tipo de couve.'),
  ('154', '2', 'Qual destas palavras NÃO é um substantivo composto?', '["guarda-chuva", "pé-de-moleque", "livro", "couve-flor"]'::jsonb, 2, 'Os substantivos compostos podem ser escritos com hífen, juntos ou separados, dependendo da regra ortográfica.')
ON CONFLICT (id) DO NOTHING;

-- História - Expansão Territorial
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('200', '3', 'O que eram as Entradas no período colonial brasileiro?', '["Expedições oficiais organizadas pelo governo português", "Festas tradicionais dos indígenas", "Rituais religiosos dos bandeirantes", "Tipos de embarcações usadas no litoral"]'::jsonb, 0, 'Você sabia que o nome "Bandeirantes" vem das bandeiras que carregavam durante as expedições?'),
  ('201', '3', 'Em que data foi fundado o Colégio de Piratininga, marco da fundação de São Paulo?', '["25 de janeiro de 1500", "25 de janeiro de 1554", "7 de setembro de 1822", "22 de abril de 1500"]'::jsonb, 1, 'O local onde foi fundado o colégio hoje é o Pátio do Colégio, no centro de São Paulo!'),
  ('202', '3', 'Quem foram os fundadores do Colégio de Piratininga?', '["Padres Antônio Vieira e Bartolomeu de Gusmão", "Padres José de Anchieta e Manuel da Nóbrega", "Padres Diogo Antônio Feijó e Feijó", "Padres João Ramalho e Leonardo Nunes"]'::jsonb, 1, 'José de Anchieta tinha apenas 19 anos quando chegou ao Brasil e se tornou um dos fundadores de São Paulo!'),
  ('203', '3', 'Qual foi o primeiro nome da cidade de São Paulo?', '["São Paulo dos Campos de Piratininga", "Vila de São Paulo", "São Paulo de Piratininga", "Cidade de São Paulo"]'::jsonb, 2, 'O nome "Piratininga" vem do tupi e significa "peixe seco", uma referência ao período de seca do rio Tamanduateí, quando os peixes ficavam presos nas poças d''água!')
ON CONFLICT (id) DO NOTHING;

-- História - Bandeirantes e Ouro
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('204', '3', 'O que motivava os bandeirantes em suas expedições?', '["Apenas a busca por ouro", "Busca por indígenas, ouro e pedras preciosas", "Exploração científica do território", "Conversão de indígenas ao cristianismo"]'::jsonb, 1, 'Você sabia que o nome "Vila Rica" (atual Ouro Preto) foi dado por causa da grande quantidade de ouro encontrada na região?'),
  ('205', '3', 'O que foi a Guerra dos Emboabas (1707)?', '["Uma batalha entre portugueses e espanhóis", "Um conflito entre paulistas e forasteiros pelo controle das minas", "Uma revolta de escravizados", "Uma disputa entre bandeirantes e jesuítas"]'::jsonb, 1, 'A palavra "emboaba" era usada para se referir aos forasteiros e significa "ave de pés emplumados", em referência às botas que usavam!')
ON CONFLICT (id) DO NOTHING;

-- História - Escravidão e Sociedade
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('206', '3', 'Em que ano chegaram os primeiros navios negreiros ao Brasil?', '["1500", "1532", "1568", "1600"]'::jsonb, 2, 'Você sabia que o Brasil foi o país que mais recebeu escravizados africanos nas Américas? Foram cerca de 4,8 milhões de pessoas!'),
  ('207', '3', 'Como era a relação entre a Casa-Grande e a Senzala?', '["Eram construções iguais para diferentes classes sociais", "A Casa-Grande era a moradia dos senhores e a Senzala dos escravizados", "Eram nomes de cidades coloniais", "Eram tipos de plantações"]'::jsonb, 1, 'O livro "Casa-Grande & Senzala", de Gilberto Freyre, é um dos mais importantes sobre a formação da sociedade brasileira!'),
  ('208', '3', 'Como os escravos africanos chegaram ao Brasil?', '["Através de navios negreiros", "Por rotas terrestres da África", "Em embarcações pequenas pelo Oceano Pacífico", "Por meio de acordos comerciais com tribos indígenas"]'::jsonb, 0, 'A travessia do Atlântico nos navios negreiros era chamada de "Travessia do Meio" e era tão terrível que muitos escravos morriam durante a viagem.'),
  ('209', '3', 'Qual era a principal atividade econômica que utilizava mão de obra escrava no Brasil Colonial?', '["Extrair borracha na Amazônia", "Fabricação de açúcar nos engenhos", "Cultivo de café no Sudeste", "Mineração de diamantes"]'::jsonb, 1, 'Você sabia que um único engenho de açúcar podia ter centenas de escravos trabalhando? Era um trabalho extremamente pesado e perigoso!')
ON CONFLICT (id) DO NOTHING;

-- História - Trabalho nas Minas
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('210', '3', 'Qual era o imposto cobrado pela Coroa Portuguesa sobre o ouro extraído?', '["Um terço do ouro encontrado", "Um quinto do ouro encontrado", "Metade do ouro encontrado", "Um décimo do ouro encontrado"]'::jsonb, 1, 'Você sabia que a expressão "tirar o couro" vem do hábito de esconder ouro em couro de animais para fugir dos impostos?'),
  ('211', '3', 'O que era a Casa de Fundição, criada em 1719?', '["Local onde se fabricavam ferramentas para as minas", "Oficina de ourivesaria", "Local onde o ouro era derretido e transformado em barras para cobrança de impostos", "Fábrica de moedas"]'::jsonb, 2, 'Para cada barra de ouro, uma parte era retirada como imposto e a barra recebia um selo real, comprovando o pagamento!'),
  ('212', '3', 'Qual foi o período conhecido como "Ciclo do Ouro" no Brasil?', '["1500-1600", "1600-1700", "1691-1800", "1750-1850"]'::jsonb, 2, 'Nesse período, a população de Minas Gerais cresceu tanto que a capital da colônia foi transferida de Salvador para o Rio de Janeiro, que estava mais próximo das minas!'),
  ('213', '3', 'O que era o "quinto" no período do Ciclo do Ouro?', '["Um imposto que correspondia à quinta parte de toda produção de ouro", "O nome dado aos cinco principais garimpos de ouro", "A distância mínima entre as minas de ouro", "O número de dias de trabalho obrigatório por semana"]'::jsonb, 0, 'Para garantir o pagamento do quinto, foram criadas as Casas de Fundição, onde todo o ouro em pó deveria ser transformado em barras e taxado!')
ON CONFLICT (id) DO NOTHING;

-- História - Conjuração Mineira
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('214', '3', 'Quem foi o líder da Inconfidência Mineira?', '["Dom Pedro I", "Joaquim José da Silva Xavier (Tiradentes)", "Tomás Antônio Gonzaga", "Cláudio Manuel da Costa"]'::jsonb, 1, 'Você sabia que Tiradentes recebeu esse apelido porque também trabalhava como dentista?'),
  ('215', '3', 'Qual era o principal objetivo da Inconfidência Mineira?', '["Abolir a escravidão no Brasil", "Proclamar a independência de Minas Gerais", "Aumentar os impostos sobre o ouro", "Criar uma universidade em Vila Rica"]'::jsonb, 1, 'Você sabia que o lema da bandeira de Minas Gerais, "Libertas Quae Sera Tamen", foi inspirado no movimento da Inconfidência Mineira?'),
  ('216', '3', 'Em que ano foi criada a vila de Vila Rica, atual Ouro Preto?', '["1701", "1711", "1721", "1731"]'::jsonb, 1, 'Vila Rica foi a primeira vila criada na região das minas e mais tarde se tornou a capital de Minas Gerais!'),
  ('217', '3', 'Em que ano a capital do Brasil foi transferida de Salvador para o Rio de Janeiro?', '["1750", "1763", "1775", "1789"]'::jsonb, 1, 'O Rio de Janeiro permaneceu como capital do Brasil por quase 200 anos, até a construção de Brasília em 1960!'),
  ('218', '3', 'Quais são considerados três dos principais bandeirantes do período colonial?', '["Dom Pedro I, Dom João VI e José Bonifácio", "Fernão Dias Paes, Borba Gato e Bartolomeu Bueno da Silva", "Tiradentes, Tomás Antônio Gonzaga e Cláudio Manuel da Costa", "Anchieta, Nóbrega e Manuel da Nóbrega"]'::jsonb, 1, 'O apelido "Anhanguera" dado a Bartolomeu Bueno significa "diabo velho" em tupi, pois ele teria ateado fogo em álcool para assustar os indígenas!')
ON CONFLICT (id) DO NOTHING;

-- Geografia - Rios brasileiros
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('300', '4', 'Qual é o rio mais extenso do Brasil?', '["Rio Amazonas", "Rio São Francisco", "Rio Paraná", "Rio Tocantins"]'::jsonb, 0, 'O Rio Amazonas despeja no oceano cerca de 209 milhões de litros de água por segundo!'),
  ('301', '4', 'Complete a frase: O Rio São Francisco nasce em ______ e deságua no Oceano ______.', '["Bahia, Atlântico", "Minas Gerais, Pacífico", "Minas Gerais, Atlântico", "Bahia, Pacífico"]'::jsonb, 2, 'O Rio São Francisco é conhecido como "rio da integração nacional" por cortar cinco estados brasileiros!'),
  ('302', '4', 'Qual parte do rio é conhecida como sua nascente?', '["Onde o rio encontra o mar", "O ponto mais largo do rio", "O local onde o rio começa", "O trecho mais profundo do rio"]'::jsonb, 2, 'Algumas nascentes do Brasil têm águas termais que podem chegar a 40°C!'),
  ('303', '4', 'Qual é a maior bacia hidrográfica do Brasil?', '["Bacia do Rio São Francisco", "Bacia Amazônica", "Bacia do Rio Paraná", "Bacia do Rio Tocantins"]'::jsonb, 1, 'A vazão média da Bacia Amazônica é maior que a soma das vazões dos 6 maiores rios do mundo juntos!'),
  ('304', '4', 'O clima tropical predomina no Brasil por causa da localização do país na zona intertropical.', '["Verdadeiro", "Falso"]'::jsonb, 0, 'O Brasil é o único país cortado pelo Equador e pelo Trópico de Capricórnio!'),
  ('305', '4', 'Qual destes biomas é conhecido como "Savana brasileira" e possui árvores de troncos retorcidos?', '["Mata Atlântica", "Cerrado", "Caatinga", "Pantanal"]'::jsonb, 1, 'O Cerrado é considerado a savana mais rica em biodiversidade do mundo, abrigando cerca de 5% de todas as espécies do planeta!'),
  ('306', '4', 'Qual é a capital do Amazonas?', '["Belém", "Manaus", "Porto Velho", "Rio Branco"]'::jsonb, 1, 'Manaus é chamada de "Paris dos Trópicos" por seu período áureo durante o ciclo da borracha!'),
  ('307', '4', 'Qual desses parques nacionais NÃO está na Região Norte?', '["Parque Nacional do Jaú", "Parque Nacional da Chapada dos Veadeiros", "Parque Nacional do Monte Roraima", "Parque Nacional da Amazônia"]'::jsonb, 1, 'O Parque Nacional do Jaú é o maior parque de floresta tropical do mundo, com 2.367.333 hectares!'),
  ('308', '4', 'Qual é a diferença entre clima e tempo?', '["Clima é o que acontece agora e tempo é a previsão para a semana", "Clima é o comportamento médio da atmosfera em longo prazo, tempo é o estado momentâneo", "Tempo é o que medimos em anos e clima em dias", "Não há diferença, os termos são sinônimos"]'::jsonb, 1, 'Você sabia que o Brasil tem todos os tipos de clima do mundo, exceto o clima desértico e o clima polar?'),
  ('309', '4', 'Qual característica é típica dos rios de planalto?', '["Pouco aproveitamento para geração de energia", "Pouco desnível ao longo do curso", "Grande potencial para navegação", "Grande desnível e quedas d''água"]'::jsonb, 3, 'A Usina de Itaipu, no Rio Paraná, é a segunda maior usina hidrelétrica do mundo em geração de energia!')
ON CONFLICT (id) DO NOTHING;

-- Geografia - Continuação (adicionar mais questões conforme necessário)
-- Ciências
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('400', '5', 'Qual dessas NÃO é uma característica da puberdade?', '["Crescimento dos pelos pubianos", "Aumento da estatura", "Crescimento dos dentes de leite", "Desenvolvimento dos seios nas meninas"]'::jsonb, 2, 'A puberdade geralmente começa entre os 8-13 anos nas meninas e 9-14 anos nos meninos!'),
  ('401', '5', 'O que ocorre com os meninos durante a puberdade?', '["A voz se torna mais aguda", "Começam a menstruar", "Crescimento dos testículos e da voz mais grossa", "Aumento da quantidade de leite materno"]'::jsonb, 2, 'A mudança de voz nos meninos é causada pelo crescimento da laringe e das cordas vocais.'),
  ('402', '5', 'Qual hormônio é responsável pelo início da puberdade?', '["Insulina", "Testosterona", "Estrogênio", "GnRH (hormônio liberador de gonadotrofina)"]'::jsonb, 3, 'O GnRH age como o "sinal de partida" do desenvolvimento da puberdade.'),
  ('403', '5', 'Qual dessas glândulas está localizada no cérebro e regula o sono?', '["Tireoide", "Hipófise", "Pineal", "Paratireoide"]'::jsonb, 2, 'Dormir no escuro total ajuda a glândula pineal a produzir mais melatonina!'),
  ('404', '5', 'O que fazem as glândulas sudoríparas?', '["Produzem saliva", "Produzem hormônios sexuais", "Produzem leite materno", "Produzem suor para controlar a temperatura"]'::jsonb, 3, 'As pessoas têm entre 2 e 4 milhões de glândulas sudoríparas!')
ON CONFLICT (id) DO NOTHING;

-- Inglês
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('9', '6', 'Como se diz "obrigado" em inglês?', '["Please", "Thank you", "Sorry", "Hello"]'::jsonb, 1, '"Thank you" é a forma mais comum de agradecer em inglês. A expressão "thanks" é uma versão mais informal. O inglês é a língua mais falada no mundo, com mais de 1,5 bilhão de falantes.'),
  ('10', '6', 'Qual é a tradução de "casa" para inglês?', '["House", "Home", "Room", "Building"]'::jsonb, 0, '"House" refere-se à estrutura física, enquanto "home" refere-se ao conceito emocional de lar. O inglês tem muitas palavras que parecem similares ao português devido à origem latina comum.')
ON CONFLICT (id) DO NOTHING;

-- Física
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('11', '7', 'Qual é a unidade de medida da força?', '["Joule", "Newton", "Watt", "Pascal"]'::jsonb, 1, 'O Newton (N) é a unidade de força no Sistema Internacional, nomeada em homenagem a Isaac Newton. 1 Newton é a força necessária para acelerar 1 kg a 1 m/s². A fórmula da força é F = m × a.'),
  ('12', '7', 'Qual é a velocidade da luz no vácuo?', '["300.000 km/s", "150.000 km/s", "450.000 km/s", "600.000 km/s"]'::jsonb, 0, 'A velocidade da luz no vácuo é aproximadamente 299.792.458 m/s (cerca de 300.000 km/s). É a velocidade máxima possível no universo segundo a teoria da relatividade de Einstein. Nada pode viajar mais rápido que a luz!')
ON CONFLICT (id) DO NOTHING;

-- Química
INSERT INTO questions (id, subject_id, question, options, correct_answer, fun_fact) VALUES
  ('13', '8', 'Qual é o símbolo químico da água?', '["H2O", "CO2", "O2", "NaCl"]'::jsonb, 0, 'H₂O é a fórmula química da água, composta por 2 átomos de hidrogênio e 1 átomo de oxigênio. A água cobre cerca de 71% da superfície da Terra e é essencial para toda a vida no planeta.'),
  ('14', '8', 'Qual é o pH da água pura?', '["5", "6", "7", "8"]'::jsonb, 2, 'O pH da água pura é 7, considerado neutro. Valores abaixo de 7 são ácidos e acima de 7 são básicos (alcalinos). A escala de pH vai de 0 a 14 e é logarítmica, então cada unidade representa uma mudança de 10 vezes na acidez.')
ON CONFLICT (id) DO NOTHING;
