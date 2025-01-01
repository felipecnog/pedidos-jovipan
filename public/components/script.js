//funções gerais
window.onload = function () {
    // Função para verificar o papel do usuário e exibir o conteúdo apropriado
    fetch('/verificar-usuario', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            if (data.role === 'administrador') {
                // Exibe conteúdo para administrador
                document.getElementById('adminContent').style.display = 'block';
                document.getElementById('userContent').style.display = 'none';
            } else if (data.role === 'utilizador') {
                // Exibe conteúdo para utilizador
                document.getElementById('userContent').style.display = 'block';
                document.getElementById('adminContent').style.display = 'none';
            } else {
                alert('Acesso não autorizado!');
            }
        })
        .catch(error => {
            console.error('Erro ao verificar o papel do usuário:', error);
            alert('Erro ao verificar acesso!');
        });

    // Função de Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
    
        const response = await fetch('/logout', {
            method: 'GET'
        });

        if (response.ok) {
            window.location.href = '/'; // Redireciona para a página de login após o logout
        } else {
            alert('Erro ao finalizar sessão.');
        }
    });
};
async function loadComponent(selector, file) {
    const element = document.querySelector(selector);
    if (element) {
        const response = await fetch(file);
        const content = await response.text();

        if (file.endsWith('.js')) {
            // Se for um script JS, cria e anexa o script corretamente
            const script = document.createElement('script');
            script.textContent = content;
            element.appendChild(script); // Adiciona o script no DOM
        } else {
            // Se for HTML, apenas insere o conteúdo HTML
            element.innerHTML = content;
        }
    }
}
//funções pedidos.hml
let pedidos = [];
let clientes = [];

async function carregarClientes() {
    const response = await fetch('/clientes');
    clientes = await response.json();

    const clienteSelect = document.getElementById('cliente');
    clienteSelect.innerHTML = clientes.map(cliente => `<option value="${cliente.id}">${cliente.nome}</option>`).join('');
}

document.getElementById('formPedido').addEventListener('submit', async (e) => {
    e.preventDefault();

    const clienteId = document.getElementById('cliente').value;
    const envio = document.getElementById('envio').value;
    const observacoes = document.getElementById('observacoes').value;
    const horaEnvio = document.getElementById('horaEnvio').value;  // Captura a hora de envio
    const pagamento = document.getElementById('pagamento').value;  // Captura o método de pagamento

    console.log('Hora de envio:', horaEnvio);  // Verifique se a hora de envio está sendo capturada corretamente
    console.log('Método de pagamento:', pagamento);  // Verifique se o método de pagamento está correto

    try {
        const response = await fetch('/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clienteId, envio, observacoes, horaEnvio, pagamento }),  // Envia os dados
        });

        const data = await response.json();
        console.log('Resposta do servidor:', data);

        if (response.ok) {
            alert('Pedido cadastrado com sucesso!');
            carregarPedidos();
            document.getElementById('formPedido').reset();
        } else {
            console.error('Erro ao cadastrar pedido:', data.error);
            alert(`Erro ao cadastrar pedido: ${data.error}`);
        }
    } catch (err) {
        console.error('Erro no servidor:', err);
        alert('Erro no servidor. Tente novamente.');
    }
});

async function carregarPedidos() {
    const response = await fetch('/pedidos');
    pedidos = await response.json();
    exibirPedidos();
}

function exibirPedidos() {
    const listaPedidos = document.getElementById('listaPedidos');
    listaPedidos.innerHTML = '';

    const termoBusca = document.getElementById('search').value.toLowerCase();
    const pedidosFiltrados = pedidos.filter(pedido =>
        pedido.codigo.toLowerCase().includes(termoBusca) ||
        pedido.cliente_nome.toLowerCase().includes(termoBusca) ||
        pedido.cliente_telefone.toLowerCase().includes(termoBusca)
    );

    pedidosFiltrados.forEach(pedido => {
        const tr = document.createElement('tr');

        const tdCodigo = document.createElement('td');
        tdCodigo.textContent = pedido.codigo;
        tdCodigo.classList.add('col-2');
        tr.appendChild(tdCodigo);

        const tdCliente = document.createElement('td');
        tdCliente.textContent = pedido.cliente_nome || 'Cliente não encontrado';
        tdCliente.classList.add('col-4');
        tr.appendChild(tdCliente);

        const tdTelefone = document.createElement('td');
        tdTelefone.textContent = pedido.cliente_telefone || 'Cliente não encontrado';
        tdTelefone.classList.add('col-2');
        tr.appendChild(tdTelefone);

        const tdStatus = document.createElement('td');
        tdStatus.textContent = pedido.status || 'Status não encontrado';
        tdStatus.classList.add('col-2');
        tr.appendChild(tdStatus);

        const tdAcoes = document.createElement('td');
        tdAcoes.classList.add('d-flex', 'gap-1', 'col-2');

        const btnVisualizar = document.createElement('button');
        btnVisualizar.innerHTML = 'Visualizar';
        btnVisualizar.classList.add('btn', 'btn-sm', 'btn-info');
        btnVisualizar.addEventListener('click', () => {
            window.location.href = `/detalhes.html?codigo=${pedido.codigo}`;
        });

        const btnExcluir = document.createElement('button');
        btnExcluir.innerHTML = 'Excluir';
        btnExcluir.classList.add('btn', 'btn-sm', 'btn-danger');
        btnExcluir.addEventListener('click', () => excluirPedido(pedido.id));

        tdAcoes.appendChild(btnVisualizar);
        tdAcoes.appendChild(btnExcluir);
        tr.appendChild(tdAcoes);

        listaPedidos.appendChild(tr);
    });
}

document.getElementById('search').addEventListener('input', () => exibirPedidos());
carregarClientes();
carregarPedidos();

async function salvarPedido(clienteId, envio, observacoes, horaEnvio, pagamento) {
    try {
        const query = `
            INSERT INTO pedidos (cliente_id, envio, observacoes, hora_envio, pagamento)
            VALUES (?, ?, ?, ?, ?)
        `;

        // Verifique os parâmetros
        const params = [clienteId, envio, observacoes || null, horaEnvio, pagamento];
        console.log('Parâmetros da consulta SQL:', params); // Log para verificar os parâmetros

        const result = await db.query(query, params);
        return result;
    } catch (err) {
        console.error('Erro ao salvar pedido:', err);
        throw err;
    }
}

async function excluirPedido(id) {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;

    try {
        const response = await fetch(`/pedidos/${id}`, { method: 'DELETE' });

        if (response.ok) {
            alert('Pedido excluído com sucesso!');
            carregarPedidos();
        } else {
            const data = await response.json();
            alert(`Erro ao excluir pedido: ${data.error}`);
        }
    } catch (err) {
        console.error('Erro ao excluir pedido:', err);
        alert('Erro ao excluir pedido. Tente novamente.');
    }
}
//funçõe login.html
