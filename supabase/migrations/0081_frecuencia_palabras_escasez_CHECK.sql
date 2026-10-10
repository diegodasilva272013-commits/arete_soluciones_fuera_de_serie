-- CHEQUEO PREVIO de 0081: la clave NO debe existir. Esperado: 0.
select count(*) as palabras_escasez_ya_existe
from public.frecuencia_knowledge_blocks where clave = 'palabras_escasez';
