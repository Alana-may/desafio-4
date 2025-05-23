// js/script.js (Exemplo para scroll suave)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Adicionar funcionalidade para menu mobile se necessário
// const mobileMenuButton = document.getElementById('mobile-menu-button');
// const navLinks = document.getElementById('nav-links');
// mobileMenuButton.addEventListener('click', () => {
//    navLinks.classList.toggle('active');
// });

// js/dashboard.js (Exemplo conceitual)
document.addEventListener('DOMContentLoaded', () => {
    const QEDU_API_BASE_URL = 'https://api.qedu.org.br/v1'; // Exemplo, verificar URL correta e endpoints

    // Elementos do DOM
    const counterMatriculas = document.getElementById('counter-matriculas');
    const counterEscolas = document.getElementById('counter-escolas');
    const counterIdebIniciais = document.getElementById('counter-ideb-iniciais');
    const filterAno = document.getElementById('filter-ano');
    const filterRegiao = document.getElementById('filter-regiao');
    const filterMunicipio = document.getElementById('filter-municipio');
    const applyFiltersButton = document.getElementById('apply-filters');

    const sections = document.querySelectorAll('.dashboard-section');
    const navLinks = document.querySelectorAll('.sidebar nav li');

    let chartEvasaoNacional = null;
    let chartDistMatriculas = null;
    let chartEvasaoNivel = null;
    let chartInfraInternet = null;

    // Navegação entre seções
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');

            const targetId = link.getAttribute('data-target');
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active-section');
                } else {
                    section.classList.remove('active-section');
                }
            });
            // O ideal é carregar os dados da nova seção aqui se não foram carregados antes
            // ou se os filtros mudaram.
            loadDataForSection(targetId);
        });
    });

    async function fetchData(endpoint, params = {}) {
        const url = new URL(`${QEDU_API_BASE_URL}/${endpoint}`);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        // Adicionar chave de API se necessária: headers: { 'Authorization': 'Bearer SEU_TOKEN_API' }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 404) console.warn(`Dados não encontrados para: ${url}`);
                else console.error(`Erro HTTP: ${response.status} para ${url}`);
                return null; // Tratar como dados não encontrados ou erro específico
            }
            return await response.json();
        } catch (error) {
            console.error(`Falha na requisição para ${url}:`, error);
            return null; // Indica falha na comunicação
        }
    }

    function displayError(elementId, chartInstance) {
        const errorElement = document.getElementById(`error-${elementId}`);
        const canvasElement = document.getElementById(`chart-${elementId}`);
        if(errorElement) errorElement.style.display = 'block';
        if(canvasElement) canvasElement.style.display = 'none';
        if (chartInstance) {
            chartInstance.destroy(); // Destruir instância anterior do gráfico
            chartInstance = null;
        }
    }

    function clearError(elementId) {
         const errorElement = document.getElementById(`error-${elementId}`);
         const canvasElement = document.getElementById(`chart-${elementId}`);
         if(errorElement) errorElement.style.display = 'none';
         if(canvasElement) canvasElement.style.display = 'block';
    }


    async function loadVisaoGeralData(filters = {}) {
        // Simulação de carregamento de dados para contadores
        if (counterMatriculas) counterMatriculas.textContent = 'Aguarde...';
        if (counterEscolas) counterEscolas.textContent = 'Aguarde...';
        if (counterIdebIniciais) counterIdebIniciais.textContent = 'Aguarde...';

        // Exemplo: Dados de matrículas (substituir com chamadas reais)
        // const matriculasData = await fetchData('matriculas', { year: filters.ano, ... });
        // if (matriculasData && matriculasData.total) {
        //    if (counterMatriculas) counterMatriculas.textContent = matriculasData.total.toLocaleString('pt-BR');
        // } else {
        //    if (counterMatriculas) counterMatriculas.textContent = 'N/D';
        // }
        setTimeout(() => { // Simular chamada API
             if (counterMatriculas) counterMatriculas.textContent = (Math.random() * 1000000).toLocaleString('pt-BR', {maximumFractionDigits:0});
             if (counterEscolas) counterEscolas.textContent = (Math.random() * 5000).toLocaleString('pt-BR', {maximumFractionDigits:0});
             if (counterIdebIniciais) counterIdebIniciais.textContent = (Math.random() * 5 + 2).toFixed(1);
        }, 1500);


        // Carregar Gráfico de Evasão Nacional (exemplo estático, idealmente da API)
        clearError('evasao-nacional');
        const evasaoNacionalCtx = document.getElementById('chart-evasao-nacional')?.getContext('2d');
        if (evasaoNacionalCtx) {
            if (chartEvasaoNacional) chartEvasaoNacional.destroy(); // Limpa gráfico anterior
            // const dataEvasaoNacional = await fetchData('evasao/historico', { pais: 'brasil', ...filters });
            // if(dataEvasaoNacional) { ... } else { displayError('evasao-nacional', chartEvasaoNacional); return; }
            chartEvasaoNacional = new Chart(evasaoNacionalCtx, {
                type: 'line',
                data: {
                    labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
                    datasets: [{
                        label: 'Evasão Ens. Médio (%)',
                        data: [7.5, 7.2, 8.0, 7.8, 7.0, 6.5], // Dados de exemplo
                        borderColor: 'rgba(255, 99, 132, 1)',
                        tension: 0.1
                    }]
                }
            });
        } else {
            console.warn("Elemento canvas 'chart-evasao-nacional' não encontrado.");
        }


        // Carregar Gráfico de Distribuição de Matrículas
        clearError('dist-matriculas');
        const distMatriculasCtx = document.getElementById('chart-dist-matriculas')?.getContext('2d');
        if (distMatriculasCtx) {
            if (chartDistMatriculas) chartDistMatriculas.destroy();
             // const dataDist = await fetchData('matriculas/distribuicao', { ...filters });
             // if(dataDist) { ... } else { displayError('dist-matriculas', chartDistMatriculas); return; }
            chartDistMatriculas = new Chart(distMatriculasCtx, {
                type: 'pie',
                data: {
                    labels: ['Educação Infantil', 'Ensino Fundamental', 'Ensino Médio'],
                    datasets: [{
                        label: 'Distribuição de Matrículas',
                        data: [25, 55, 20], // Dados de exemplo
                        backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)']
                    }]
                }
            });
        } else {
             console.warn("Elemento canvas 'chart-dist-matriculas' não encontrado.");
        }
    }

    async function loadEvasaoData(filters = {}) {
        clearError('evasao-nivel');
        const evasaoNivelCtx = document.getElementById('chart-evasao-nivel')?.getContext('2d');
        if (evasaoNivelCtx) {
            if (chartEvasaoNivel) chartEvasaoNivel.destroy();
            // const dataEvasao = await fetchData('evasao/por_nivel', { ...filters });
            // if(dataEvasao) {
            //    chartEvasaoNivel = new Chart( ... );
            // } else {
            //    displayError('evasao-nivel', chartEvasaoNivel);
            //    return;
            // }
            // Simulação:
            setTimeout(() => {
                chartEvasaoNivel = new Chart(evasaoNivelCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Fundamental I', 'Fundamental II', 'Ensino Médio'],
                        datasets: [{
                            label: 'Taxa de Evasão (%) na Seleção',
                            data: [ (Math.random()*5).toFixed(1), (Math.random()*8).toFixed(1), (Math.random()*12).toFixed(1)],
                            backgroundColor: ['rgba(255, 159, 64, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(201, 203, 207, 0.7)']
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }, 500);
        }
    }

    async function loadInfraestruturaData(filters = {}) {
        clearError('infra-internet');
        const infraInternetCtx = document.getElementById('chart-infra-internet')?.getContext('2d');
        if(infraInternetCtx) {
            if(chartInfraInternet) chartInfraInternet.destroy();
            // const dataInfra = await fetchData('infraestrutura/internet', {...filters});
            // if (dataInfra && typeof dataInfra.percentualComInternet !== 'undefined') {
            //     const percentual = dataInfra.percentualComInternet;
            //     chartInfraInternet = new Chart(infraInternetCtx, {
            //         type: 'doughnut',
            //         data: {
            //             labels: ['Com Internet', 'Sem Internet'],
            //             datasets: [{
            //                 data: [percentual, 100 - percentual],
            //                 backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)']
            //             }]
            //         }
            //     });
            // } else {
            //     displayError('infra-internet', chartInfraInternet);
            // }
            // Simulação:
            setTimeout(() => {
                const percentual = (Math.random() * 60 + 30).toFixed(0); // Entre 30 e 90%
                chartInfraInternet = new Chart(infraInternetCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Com Internet', 'Sem Internet'],
                        datasets: [{
                            data: [percentual, 100 - percentual],
                            backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(220, 220, 220, 0.7)']
                        }]
                    },
                     options: { responsive: true, maintainAspectRatio: false }
                });
            }, 700);
        }
    }


    function loadDataForSection(sectionId, filters = {}) {
        switch(sectionId) {
            case 'visao-geral':
                loadVisaoGeralData(filters);
                break;
            case 'evasao':
                loadEvasaoData(filters);
                break;
            // case 'ideb':
            //     loadIdebData(filters);
            //     break;
            case 'infraestrutura':
                loadInfraestruturaData(filters);
                break;
            // case 'professores':
            //     loadProfessoresData(filters);
            //     break;
        }
    }

    function populateFilters() {
        // Anos (exemplo)
        const currentYear = new Date().getFullYear();
        for (let i = 0; i < 5; i++) {
            const year = currentYear - i;
            filterAno.innerHTML += `<option value="${year}">${year}</option>`;
        }

        // Regiões/UF (exemplo, idealmente da API ou lista mais completa)
        const ufs = ["Brasil", "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
        ufs.forEach(uf => {
            filterRegiao.innerHTML += `<option value="${uf.toLowerCase()}">${uf}</option>`;
        });

        filterRegiao.addEventListener('change', async (e) => {
            const selectedUf = e.target.value;
            filterMunicipio.innerHTML = '<option value="">Todos os municípios</option>'; // Reset
            if (selectedUf && selectedUf !== "brasil") {
                // const municipiosData = await fetchData(`localidades/municipios`, { uf: selectedUf });
                // if (municipiosData && municipiosData.length) {
                //     municipiosData.forEach(mun => {
                //         filterMunicipio.innerHTML += `<option value="${mun.id}">${mun.nome}</option>`;
                //     });
                // }
                // Simulação:
                if (selectedUf === 'sp') { // Exemplo
                     filterMunicipio.innerHTML += `<option value="sao_paulo">São Paulo</option>`;
                     filterMunicipio.innerHTML += `<option value="campinas">Campinas</option>`;
                }
            }
        });
    }

    applyFiltersButton.addEventListener('click', () => {
        const currentFilters = {
            ano: filterAno.value,
            regiao: filterRegiao.value,
            municipio: filterMunicipio.value
        };
        const activeSection = document.querySelector('.sidebar nav li.active').getAttribute('data-target');
        loadDataForSection(activeSection, currentFilters);
    });

    // Carga inicial
    populateFilters();
    loadDataForSection('visao-geral'); // Carrega dados da primeira aba
});

// Fontes:
// 1. https://github.com/EsdrasNeto05/netos-chatbot-website
// 2. https://github.com/mahrokh75/git_project_Alaei
// 3. https://stackoverflow.com/questions/53547498/jquery-error-only-on-ie11-syntax-error-foreachanchor
// 4. https://github.com/Rafael-N-Lopes/opa
// 5. https://stackoverflow.com/questions/78688642/javascript-debug-statements-not-showing-up-on-console
// 6. https://github.com/githubfdesire/TeamDesireSite
// 7. https://github.com/saloni-27/PRODIGY_WD_01