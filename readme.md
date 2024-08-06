# Diagram As Code
Visor de diagramas HTML y JS como código para documentación de proyectos

- BPMN -> Camunda
- Mermaid -> MarkDown
- PlantUML -> *.puml
- Excalidraw -> *.Excalidraw

# Uso
El archivo <strong>/diagramas/index.json</strong> contiene la estructura del menú, cada item debe contener:

```json
{
    "nombre": "Nombre del Menu o Diagrama",
    "tipo": "Tipo de diagrama valores: [bpmn, mermaid, plantuml, excalidraw, md]",
    "archivo": "Nombre del diagrama correspondiente al tipo, ubicado en /diagramas/*"
}
```