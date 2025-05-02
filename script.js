document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const structureTree = document.getElementById("structureTree");
  const addFieldBtn = document.getElementById("addFieldBtn");
  const generateBtn = document.getElementById("generateBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const jsonOutput = document.getElementById("jsonOutput");
  const totalEntriesInput = document.getElementById("totalEntries");

  // Modal Elements
  const fieldModal = document.getElementById("fieldModal");
  const modalTitle = document.getElementById("modalTitle");
  const fieldForm = document.getElementById("fieldForm");
  const parentPathInput = document.getElementById("parentPath");
  const editingFieldInput = document.getElementById("editingField");
  const fieldNameInput = document.getElementById("fieldName");
  const fieldTypeSelect = document.getElementById("fieldType");
  const fieldValuesTextarea = document.getElementById("fieldValues");
  const valueOptions = document.getElementById("valueOptions");
  const numberOptions = document.getElementById("numberOptions");
  const booleanOptions = document.getElementById("booleanOptions");
  const arrayOptions = document.getElementById("arrayOptions");
  const minValueInput = document.getElementById("minValue");
  const maxValueInput = document.getElementById("maxValue");
  const decimalPlacesInput = document.getElementById("decimalPlaces");
  const boolProbInput = document.getElementById("boolProb");
  const boolProbValue = document.getElementById("boolProbValue");
  const minItemsInput = document.getElementById("minItems");
  const maxItemsInput = document.getElementById("maxItems");
  const cancelBtn = document.getElementById("cancelBtn");
  const closeModal = document.querySelector(".close-modal");

  // Data structure to hold the JSON schema
  let jsonSchema = {};

  // Map to store the order of fields
  const fieldOrder = new Map();

  // Generated JSON data
  let generatedJSON = null;

  // Sortable instances
  const sortableInstances = new Map();

  // Event Listeners
  addFieldBtn.addEventListener("click", () => openAddFieldModal(""));
  generateBtn.addEventListener("click", generateJSON);
  downloadBtn.addEventListener("click", downloadJSON);
  fieldTypeSelect.addEventListener("change", updateFieldOptions);
  boolProbInput.addEventListener("input", updateBoolProbDisplay);
  fieldForm.addEventListener("submit", saveField);
  cancelBtn.addEventListener("click", closeFieldModal);
  closeModal.addEventListener("click", closeFieldModal);

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === fieldModal) {
      closeFieldModal();
    }
  });

  // Initialize with some example fields
  initializeExampleSchema();

  // Function to initialize with example schema
  function initializeExampleSchema() {
    jsonSchema = {
      id: {
        type: "string",
        values: [
          "NG-LAG-10001",
          "NG-ABJ-20045",
          "NG-OWE-10010",
          "NG-PH-30089",
          "NG-KAN-40023",
        ],
      },
      transaction_type: {
        type: "array",
        values: ["sale", "lease", "rent", "auction"],
        minItems: 1,
        maxItems: 2,
      },
      property_type: {
        type: "string",
        values: [
          "residential",
          "commercial",
          "industrial",
          "mixed-use",
          "land",
        ],
      },
      price: {
        type: "object",
        children: {
          amount: {
            type: "number",
            min: 50000000,
            max: 500000000,
            decimals: 0,
          },
          currency: {
            type: "string",
            values: ["NGN", "USD", "EUR", "GBP"],
          },
        },
      },
      agent: {
        type: "object",
        children: {
          name: {
            type: "string",
            values: [
              "Oluwaseun Okafor",
              "Chinedu Eze",
              "Ngozi Okonkwo",
              "Emeka Nduka",
              "Fatima Abubakar",
            ],
          },
          company: {
            type: "string",
            values: [
              "Lagos Homes",
              "Abuja Properties",
              "Calabar Properties",
              "Port Harcourt Realty",
              "Kano Estates",
            ],
          },
          license_number: {
            type: "string",
            values: [
              "RECN-21841",
              "RECN-18765",
              "RECN-30912",
              "RECN-25678",
              "RECN-19023",
            ],
          },
          contact: {
            type: "string",
            values: [
              "+2348691074556",
              "+2349045678123",
              "+2347089123456",
              "+2348123456789",
              "+2349087654321",
            ],
          },
          verification_status: {
            type: "string",
            values: ["verified", "pending", "unverified"],
          },
        },
      },
      location: {
        type: "object",
        children: {
          address: {
            type: "string",
            values: [
              "18 Yakubu Gowon Avenue, Wuse II",
              "25 Adetokunbo Ademola Crescent, Victoria Island",
              "7 Broad Street, Lagos Island",
              "12 Kofo Abayomi Street, Victoria Island",
              "5 Akin Adesola Street, Victoria Island",
            ],
          },
          city: {
            type: "string",
            values: [
              "Lagos",
              "Abuja",
              "Port Harcourt",
              "Kano",
              "Owerri",
              "Calabar",
            ],
          },
          state: {
            type: "string",
            values: ["Lagos", "FCT", "Rivers", "Kano", "Imo", "Cross River"],
          },
          coordinates: {
            type: "object",
            children: {
              lat: {
                type: "number",
                min: 4.5,
                max: 13.5,
                decimals: 7,
              },
              lng: {
                type: "number",
                min: 2.5,
                max: 14.5,
                decimals: 7,
              },
              accuracy: {
                type: "string",
                values: ["high", "medium", "low"],
              },
            },
          },
        },
      },
    };

    // Initialize field order
    initializeFieldOrder();

    renderJsonStructure();
  }

  // Function to initialize field order
  function initializeFieldOrder() {
    fieldOrder.clear();

    // Set order for root fields
    const rootOrder = Object.keys(jsonSchema);
    fieldOrder.set("", rootOrder);

    // Set order for nested fields
    for (const fieldName in jsonSchema) {
      const fieldData = jsonSchema[fieldName];
      if (
        (fieldData.type === "object" || fieldData.type === "array-object") &&
        fieldData.children
      ) {
        initializeNestedFieldOrder(fieldName, fieldData.children);
      }
    }
  }

  // Function to initialize nested field order
  function initializeNestedFieldOrder(parentPath, children) {
    const childOrder = Object.keys(children);
    fieldOrder.set(parentPath, childOrder);

    for (const childName in children) {
      const childData = children[childName];
      const fullPath = `${parentPath}.${childName}`;

      if (
        (childData.type === "object" || childData.type === "array-object") &&
        childData.children
      ) {
        initializeNestedFieldOrder(fullPath, childData.children);
      }
    }
  }

  // Function to open the add field modal
  function openAddFieldModal(parentPath, editField = null) {
    parentPathInput.value = parentPath;

    // Reset form
    fieldForm.reset();

    if (editField) {
      // We're editing an existing field
      editingFieldInput.value = editField;
      modalTitle.textContent = "Edit Field";

      // Get the field data
      const fieldData = getFieldByPath(
        `${parentPath}${parentPath ? "." : ""}${editField}`
      );

      if (fieldData) {
        fieldNameInput.value = editField;
        fieldTypeSelect.value = fieldData.type;

        if (fieldData.values) {
          fieldValuesTextarea.value = fieldData.values.join(", ");
        }

        if (fieldData.min !== undefined) {
          minValueInput.value = fieldData.min;
        }

        if (fieldData.max !== undefined) {
          maxValueInput.value = fieldData.max;
        }

        if (fieldData.decimals !== undefined) {
          decimalPlacesInput.value = fieldData.decimals;
        }

        if (fieldData.probability !== undefined) {
          boolProbInput.value = fieldData.probability * 100;
          boolProbValue.textContent = `${fieldData.probability * 100}%`;
        }

        if (fieldData.minItems !== undefined) {
          minItemsInput.value = fieldData.minItems;
        }

        if (fieldData.maxItems !== undefined) {
          maxItemsInput.value = fieldData.maxItems;
        }
      }
    } else {
      // We're adding a new field
      editingFieldInput.value = "";
      modalTitle.textContent = "Add New Field";
    }

    // Update field options based on selected type
    updateFieldOptions();

    // Show modal
    fieldModal.style.display = "block";
  }

  // Function to close the field modal
  function closeFieldModal() {
    fieldModal.style.display = "none";
  }

  // Function to update field options based on selected type
  function updateFieldOptions() {
    const fieldType = fieldTypeSelect.value;

    // Hide all option sections first
    valueOptions.classList.add("hidden");
    numberOptions.classList.add("hidden");
    booleanOptions.classList.add("hidden");
    arrayOptions.classList.add("hidden");

    // Show relevant options based on field type
    switch (fieldType) {
      case "string":
        valueOptions.classList.remove("hidden");
        break;
      case "number":
        numberOptions.classList.remove("hidden");
        break;
      case "boolean":
        booleanOptions.classList.remove("hidden");
        break;
      case "array":
        valueOptions.classList.remove("hidden");
        arrayOptions.classList.remove("hidden");
        break;
      case "array-object":
        arrayOptions.classList.remove("hidden");
        break;
    }
  }

  // Function to update boolean probability display
  function updateBoolProbDisplay() {
    boolProbValue.textContent = `${boolProbInput.value}%`;
  }

  // Function to save field
  function saveField(event) {
    event.preventDefault();

    const parentPath = parentPathInput.value;
    const fieldName = fieldNameInput.value.trim();
    const fieldType = fieldTypeSelect.value;
    const editingField = editingFieldInput.value;

    // Validate field name
    if (!fieldName) {
      alert("Field name is required");
      return;
    }

    // Create field data object
    const fieldData = {
      type: fieldType,
    };

    // Add type-specific properties
    switch (fieldType) {
      case "string":
      case "array":
        const valuesText = fieldValuesTextarea.value.trim();
        if (valuesText) {
          fieldData.values = valuesText
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v);
        } else {
          fieldData.values = ["Sample Value"];
        }
        break;
      case "number":
        fieldData.min = Number.parseFloat(minValueInput.value) || 0;
        fieldData.max = Number.parseFloat(maxValueInput.value) || 100;
        fieldData.decimals = Number.parseInt(decimalPlacesInput.value) || 0;
        break;
      case "boolean":
        fieldData.probability = Number.parseInt(boolProbInput.value) / 100;
        break;
      case "object":
      case "array-object":
        // If we're editing an existing field, preserve its children
        if (editingField && editingField === fieldName) {
          const existingField = getFieldByPath(
            `${parentPath}${parentPath ? "." : ""}${editingField}`
          );
          if (existingField && existingField.children) {
            fieldData.children = existingField.children;
          } else {
            fieldData.children = {};
          }
        } else {
          fieldData.children = {};
        }
        break;
    }

    // Add array-specific properties
    if (fieldType === "array" || fieldType === "array-object") {
      fieldData.minItems = Number.parseInt(minItemsInput.value) || 1;
      fieldData.maxItems = Number.parseInt(maxItemsInput.value) || 5;
    }

    // Update field in schema
    if (editingField) {
      if (editingField !== fieldName) {
        // Field name has changed
        updateFieldName(parentPath, editingField, fieldName, fieldData);
      } else {
        // Just update the field data
        updateFieldData(parentPath, fieldName, fieldData);
      }
    } else {
      // Add new field
      addFieldToSchema(parentPath, fieldName, fieldData);
    }

    // Close modal
    closeFieldModal();

    // Render updated structure
    renderJsonStructure();
  }

  // Function to update field name
  function updateFieldName(parentPath, oldName, newName, fieldData) {
    // Get the parent object
    let parent;
    if (!parentPath) {
      parent = jsonSchema;
    } else {
      const pathParts = parentPath.split(".");
      parent = getNestedObject(jsonSchema, pathParts);
    }

    if (!parent) return;

    // Create new field with new name
    parent[newName] = fieldData;

    // Delete old field
    delete parent[oldName];

    // Update field order
    updateFieldOrderAfterRename(parentPath, oldName, newName);
  }

  // Function to update field order after rename
  function updateFieldOrderAfterRename(parentPath, oldName, newName) {
    const orderKey = parentPath || "";
    const order = fieldOrder.get(orderKey) || [];

    const index = order.indexOf(oldName);
    if (index !== -1) {
      order[index] = newName;
      fieldOrder.set(orderKey, order);
    }

    // Update any child paths in the fieldOrder map
    if (parentPath) {
      const oldPath = `${parentPath}.${oldName}`;
      const newPath = `${parentPath}.${newName}`;

      // Find all keys that start with oldPath and update them
      for (const [key, value] of fieldOrder.entries()) {
        if (key === oldPath || key.startsWith(`${oldPath}.`)) {
          const newKey = key.replace(oldPath, newPath);
          fieldOrder.set(newKey, value);
          fieldOrder.delete(key);
        }
      }
    } else {
      // Root level rename
      const oldPath = oldName;
      const newPath = newName;

      // Find all keys that start with oldPath and update them
      for (const [key, value] of fieldOrder.entries()) {
        if (key === oldPath || key.startsWith(`${oldPath}.`)) {
          const newKey = key.replace(oldPath, newPath);
          fieldOrder.set(newKey, value);
          fieldOrder.delete(key);
        }
      }
    }
  }

  // Function to update field data
  function updateFieldData(parentPath, fieldName, fieldData) {
    // Get the parent object
    let parent;
    if (!parentPath) {
      parent = jsonSchema;
    } else {
      const pathParts = parentPath.split(".");
      parent = getNestedObject(jsonSchema, pathParts);
    }

    if (!parent) return;

    // Preserve children if they exist
    if (
      parent[fieldName] &&
      parent[fieldName].children &&
      fieldData.type === parent[fieldName].type
    ) {
      fieldData.children = parent[fieldName].children;
    }

    // Update field
    parent[fieldName] = fieldData;
  }

  // Helper function to get a nested object by path
  function getNestedObject(obj, pathParts) {
    let current = obj;

    for (const part of pathParts) {
      if (current[part] && current[part].children) {
        current = current[part].children;
      } else {
        return null;
      }
    }

    return current;
  }

  // Function to add field to schema
  function addFieldToSchema(parentPath, fieldName, fieldData) {
    if (!parentPath) {
      // Add to root
      jsonSchema[fieldName] = fieldData;

      // Update field order
      const rootOrder = fieldOrder.get("") || [];
      rootOrder.push(fieldName);
      fieldOrder.set("", rootOrder);
    } else {
      // Add to nested path
      const pathParts = parentPath.split(".");
      let current = jsonSchema;

      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        if (current[part] && current[part].children) {
          current = current[part].children;
        } else {
          console.error("Invalid parent path:", parentPath);
          return;
        }
      }

      current[fieldName] = fieldData;

      // Update field order
      const parentOrder = fieldOrder.get(parentPath) || [];
      parentOrder.push(fieldName);
      fieldOrder.set(parentPath, parentOrder);
    }
  }

  // Function to remove field from schema
  function removeFieldFromSchema(path) {
    const pathParts = path.split(".");
    const fieldName = pathParts.pop();
    const parentPath = pathParts.join(".");

    if (pathParts.length === 0) {
      // Remove from root
      delete jsonSchema[fieldName];

      // Update field order
      const rootOrder = fieldOrder.get("") || [];
      const index = rootOrder.indexOf(fieldName);
      if (index !== -1) {
        rootOrder.splice(index, 1);
      }
    } else {
      // Remove from nested path
      const parent = getFieldByPath(parentPath);

      if (parent && parent.children) {
        delete parent.children[fieldName];

        // Update field order
        const parentOrder = fieldOrder.get(parentPath) || [];
        const index = parentOrder.indexOf(fieldName);
        if (index !== -1) {
          parentOrder.splice(index, 1);
        }
      }
    }

    // Remove any child field orders
    const fullPath = path;
    for (const key of [...fieldOrder.keys()]) {
      if (key === fullPath || key.startsWith(`${fullPath}.`)) {
        fieldOrder.delete(key);
      }
    }
  }

  // Function to get field by path
  function getFieldByPath(path) {
    if (!path) return null;

    const pathParts = path.split(".");
    let current = jsonSchema;

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (current[part]) {
        if (i === pathParts.length - 1) {
          return current[part];
        } else if (current[part].children) {
          current = current[part].children;
        } else {
          return null;
        }
      } else {
        return null;
      }
    }

    return null;
  }

  // Function to render JSON structure
  function renderJsonStructure() {
    structureTree.innerHTML = "";

    // Clean up any existing sortable instances
    sortableInstances.forEach((instance) => {
      instance.destroy();
    });
    sortableInstances.clear();

    // Get the root field order
    const rootOrder = fieldOrder.get("") || Object.keys(jsonSchema);

    // Create container for root fields
    const rootContainer = document.createElement("div");
    rootContainer.className = "root-container";
    structureTree.appendChild(rootContainer);

    // Render root fields in order
    for (const fieldName of rootOrder) {
      if (jsonSchema[fieldName]) {
        renderField(rootContainer, fieldName, jsonSchema[fieldName], "");
      }
    }

    // Initialize sortable for root container
    initSortable(rootContainer, "");
  }

  // Function to render a field
  function renderField(container, fieldName, fieldData, parentPath) {
    const fieldItem = document.createElement("div");
    fieldItem.className = "tree-item";
    fieldItem.dataset.fieldName = fieldName;

    const fieldHeader = document.createElement("div");
    fieldHeader.className = "tree-item-header";

    // Add drag handle
    const dragHandle = document.createElement("div");
    dragHandle.className = "tree-item-drag-handle";
    dragHandle.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </svg>`;

    const fieldNameSpan = document.createElement("span");
    fieldNameSpan.className = "tree-item-name";
    fieldNameSpan.textContent = fieldName;

    const fieldTypeSpan = document.createElement("span");
    fieldTypeSpan.className = `type-badge type-${fieldData.type}`;
    fieldTypeSpan.textContent = fieldData.type;

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "tree-item-actions";

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.className = "btn icon outline";
    editBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>`;
    editBtn.title = "Edit field";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openAddFieldModal(parentPath, fieldName);
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn icon danger";
    deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>`;
    deleteBtn.title = "Delete field";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (
        confirm(`Are you sure you want to delete the field "${fieldName}"?`)
      ) {
        removeFieldFromSchema(
          `${parentPath}${parentPath ? "." : ""}${fieldName}`
        );
        renderJsonStructure();
      }
    });

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    fieldHeader.appendChild(dragHandle);
    fieldHeader.appendChild(fieldTypeSpan);
    fieldHeader.appendChild(fieldNameSpan);
    fieldHeader.appendChild(actionsDiv);

    fieldItem.appendChild(fieldHeader);

    // If object or array of objects, add children
    if (
      (fieldData.type === "object" || fieldData.type === "array-object") &&
      fieldData.children
    ) {
      const childrenContainer = document.createElement("div");
      childrenContainer.className = "tree-item-children";

      // Add button to add child field
      const addChildBtn = document.createElement("button");
      addChildBtn.className = "btn small outline";
      addChildBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg> Add Child Field`;
      addChildBtn.addEventListener("click", () => {
        openAddFieldModal(`${parentPath}${parentPath ? "." : ""}${fieldName}`);
      });

      childrenContainer.appendChild(addChildBtn);

      // Create container for child fields
      const childFieldsContainer = document.createElement("div");
      childFieldsContainer.className = "child-fields-container";
      childrenContainer.appendChild(childFieldsContainer);

      // Render child fields in order
      const fullPath = `${parentPath}${parentPath ? "." : ""}${fieldName}`;
      const childOrder =
        fieldOrder.get(fullPath) || Object.keys(fieldData.children);

      for (const childName of childOrder) {
        if (fieldData.children[childName]) {
          renderField(
            childFieldsContainer,
            childName,
            fieldData.children[childName],
            fullPath
          );
        }
      }

      fieldItem.appendChild(childrenContainer);

      // Initialize sortable for child container
      initSortable(childFieldsContainer, fullPath);
    }

    container.appendChild(fieldItem);
  }

  // Function to initialize Sortable
  function initSortable(container, path) {
    // Assuming Sortable is available globally or imported elsewhere
    const sortable = new Sortable(container, {
      group: `sortable-${path}`,
      animation: 150,
      handle: ".tree-item-drag-handle",
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      dragClass: "sortable-drag",
      onEnd: (evt) => {
        // Update the field order after drag
        const items = Array.from(container.children).map(
          (item) => item.dataset.fieldName
        );
        fieldOrder.set(path, items);

        // If this is a root level reordering, we need to reorder the jsonSchema
        if (path === "") {
          const newSchema = {};
          for (const fieldName of items) {
            if (jsonSchema[fieldName]) {
              newSchema[fieldName] = jsonSchema[fieldName];
            }
          }
          jsonSchema = newSchema;
        } else {
          // For nested fields, we need to reorder the children
          const parent = getFieldByPath(path);
          if (parent && parent.children) {
            const newChildren = {};
            for (const fieldName of items) {
              if (parent.children[fieldName]) {
                newChildren[fieldName] = parent.children[fieldName];
              }
            }
            parent.children = newChildren;
          }
        }
      },
    });

    // Store the sortable instance for cleanup
    sortableInstances.set(path, sortable);

    return sortable;
  }

  // Function to generate JSON
  function generateJSON() {
    const totalEntries = Number.parseInt(totalEntriesInput.value) || 1;

    if (Object.keys(jsonSchema).length === 0) {
      alert("Please add at least one field to generate JSON");
      return;
    }

    // Generate JSON data
    const result = [];

    for (let i = 0; i < totalEntries; i++) {
      const entry = generateEntry(jsonSchema);
      result.push(entry);
    }

    // Store the generated JSON
    generatedJSON = result;

    // Format JSON with syntax highlighting
    const jsonString = JSON.stringify(result, null, 2);
    const highlightedJson = syntaxHighlight(jsonString);

    // Use innerHTML to properly render the HTML tags
    jsonOutput.innerHTML = highlightedJson;
    downloadBtn.disabled = false;
  }

  // Helper function for syntax highlighting
  function syntaxHighlight(json) {
    // First, escape HTML to prevent XSS
    const escaped = json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return escaped
      .replace(/"([^"]+)":/g, '<span >"$1"</span>:')
      .replace(/"([^"]+)"/g, '<span class="json-string">"$1"</span>')
      .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
      .replace(/\b(null)\b/g, '<span class="json-null">$1</span>')
      .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="json-number">$1</span>');
  }

  // Function to generate a single entry
  function generateEntry(schema) {
    const entry = {};

    // Use field order to maintain the order in the generated JSON
    const rootOrder = fieldOrder.get("") || Object.keys(schema);

    for (const fieldName of rootOrder) {
      if (schema[fieldName]) {
        const fieldData = schema[fieldName];
        entry[fieldName] = generateValue(fieldData);
      }
    }

    return entry;
  }

  // Function to generate a value based on field data
  function generateValue(fieldData) {
    switch (fieldData.type) {
      case "string":
        if (fieldData.values && fieldData.values.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * fieldData.values.length
          );
          return fieldData.values[randomIndex];
        }
        return "Sample Value";

      case "number":
        const min = fieldData.min !== undefined ? fieldData.min : 0;
        const max = fieldData.max !== undefined ? fieldData.max : 100;
        const decimals =
          fieldData.decimals !== undefined ? fieldData.decimals : 0;

        const randomValue = min + Math.random() * (max - min);
        return Number(randomValue.toFixed(decimals));

      case "boolean":
        const probability =
          fieldData.probability !== undefined ? fieldData.probability : 0.5;
        return Math.random() < probability;

      case "array":
        const minItems =
          fieldData.minItems !== undefined ? fieldData.minItems : 1;
        const maxItems =
          fieldData.maxItems !== undefined ? fieldData.maxItems : 5;

        const itemCount =
          Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;
        const array = [];

        for (let i = 0; i < itemCount; i++) {
          if (fieldData.values && fieldData.values.length > 0) {
            const randomIndex = Math.floor(
              Math.random() * fieldData.values.length
            );
            array.push(fieldData.values[randomIndex]);
          } else {
            array.push("Sample Value");
          }
        }

        return array;

      case "object":
        const obj = {};

        if (fieldData.children) {
          // Use field order to maintain the order in the generated JSON
          const childOrder =
            fieldOrder.get(fieldData.path) || Object.keys(fieldData.children);

          for (const childName of childOrder) {
            if (fieldData.children[childName]) {
              obj[childName] = generateValue(fieldData.children[childName]);
            }
          }
        }

        return obj;

      case "array-object":
        const minObjItems =
          fieldData.minItems !== undefined ? fieldData.minItems : 1;
        const maxObjItems =
          fieldData.maxItems !== undefined ? fieldData.maxItems : 3;

        const objItemCount =
          Math.floor(Math.random() * (maxObjItems - minObjItems + 1)) +
          minObjItems;
        const objArray = [];

        for (let i = 0; i < objItemCount; i++) {
          const arrayObj = {};

          if (fieldData.children) {
            // Use field order to maintain the order in the generated JSON
            const childOrder =
              fieldOrder.get(fieldData.path) || Object.keys(fieldData.children);

            for (const childName of childOrder) {
              if (fieldData.children[childName]) {
                arrayObj[childName] = generateValue(
                  fieldData.children[childName]
                );
              }
            }
          }

          objArray.push(arrayObj);
        }

        return objArray;

      default:
        return null;
    }
  }

  // Function to download JSON
  function downloadJSON() {
    if (!generatedJSON) {
      alert("Please generate JSON data first.");
      return;
    }

    const jsonString = JSON.stringify(generatedJSON, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-data.json";
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }
});
