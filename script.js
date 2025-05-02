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

  // Generated JSON data
  let generatedJSON = null;

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
    };

    renderJsonStructure();
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
        fieldData.children = {};
        break;
    }

    // Add array-specific properties
    if (fieldType === "array" || fieldType === "array-object") {
      fieldData.minItems = Number.parseInt(minItemsInput.value) || 1;
      fieldData.maxItems = Number.parseInt(maxItemsInput.value) || 5;
    }

    // Save field to schema
    const editingField = editingFieldInput.value;

    if (editingField && editingField !== fieldName) {
      // Field name has changed, remove old field
      removeFieldFromSchema(
        `${parentPath}${parentPath ? "." : ""}${editingField}`
      );
    }

    // Add new field to schema
    addFieldToSchema(parentPath, fieldName, fieldData);

    // Close modal
    closeFieldModal();

    // Render updated structure
    renderJsonStructure();
  }

  // Function to add field to schema
  function addFieldToSchema(parentPath, fieldName, fieldData) {
    if (!parentPath) {
      // Add to root
      jsonSchema[fieldName] = fieldData;
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
    }
  }

  // Function to remove field from schema
  function removeFieldFromSchema(path) {
    const pathParts = path.split(".");
    const fieldName = pathParts.pop();

    if (pathParts.length === 0) {
      // Remove from root
      delete jsonSchema[fieldName];
    } else {
      // Remove from nested path
      const parentPath = pathParts.join(".");
      const parent = getFieldByPath(parentPath);

      if (parent && parent.children) {
        delete parent.children[fieldName];
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

    // Render root fields
    for (const fieldName in jsonSchema) {
      const fieldData = jsonSchema[fieldName];
      renderField(structureTree, fieldName, fieldData, "");
    }
  }

  // Function to render a field
  function renderField(container, fieldName, fieldData, parentPath) {
    const fieldItem = document.createElement("div");
    fieldItem.className = "tree-item";

    const fieldHeader = document.createElement("div");
    fieldHeader.className = "tree-item-header";

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
    editBtn.className = "btn icon";
    editBtn.innerHTML = "✏️";
    editBtn.title = "Edit field";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openAddFieldModal(parentPath, fieldName);
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn icon danger";
    deleteBtn.innerHTML = "🗑️";
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
      addChildBtn.className = "btn small";
      addChildBtn.textContent = "+ Add Child Field";
      addChildBtn.addEventListener("click", () => {
        openAddFieldModal(`${parentPath}${parentPath ? "." : ""}${fieldName}`);
      });

      childrenContainer.appendChild(addChildBtn);

      // Render child fields
      const fullPath = `${parentPath}${parentPath ? "." : ""}${fieldName}`;
      for (const childName in fieldData.children) {
        renderField(
          childrenContainer,
          childName,
          fieldData.children[childName],
          fullPath
        );
      }

      fieldItem.appendChild(childrenContainer);
    }

    container.appendChild(fieldItem);
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

    // Store and display the generated JSON
    generatedJSON = result;
    jsonOutput.textContent = JSON.stringify(result, null, 2);
    downloadBtn.disabled = false;
  }

  // Function to generate a single entry
  function generateEntry(schema) {
    const entry = {};

    for (const fieldName in schema) {
      const fieldData = schema[fieldName];
      entry[fieldName] = generateValue(fieldData);
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
          for (const childName in fieldData.children) {
            obj[childName] = generateValue(fieldData.children[childName]);
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
            for (const childName in fieldData.children) {
              arrayObj[childName] = generateValue(
                fieldData.children[childName]
              );
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
