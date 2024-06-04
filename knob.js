class RotaryKnob {
  constructor(id, textBoxId, minValue, maxValue) {
    this.knob = document.getElementById(id);
    this.textBox = document.getElementById(textBoxId);
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.isDragging = false;
    this.rotation = 0; // Track the rotation
    this.lastRotation = this.calculateInitialRotation(); // Initialize lastRotation with the initial rotation
    
    // Bind event handlers
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    
    // Add event listeners to the knob itself
    this.knob.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    this.knob.addEventListener('touchstart', this.handleTouchStart);
    document.addEventListener('touchmove', this.handleTouchMove);
    document.addEventListener('touchend', this.handleTouchEnd);
       this.textBox.value = minValue;
    // Console logging for debugging
    console.log("RotaryKnob initialized.");
  }
  
  calculateInitialRotation() {
    // Calculate the initial rotation based on the initial value of the text box
    const value = parseFloat(this.textBox.value);
    if (!isNaN(value)) {
      const rotation = ((value - this.minValue) / (this.maxValue - this.minValue)) * 360;
      return rotation;
    } else {
      return 0; // Default to 0 if the initial value is not a valid number
    }
  }
  
  handleMouseDown() {
    console.log("Mouse Down event triggered.");
    this.isDragging = true;
    this.lastRotation = this.rotation;
  }
  
  handleMouseMove(e) {
    console.log("Mouse Move event triggered.");
    if (this.isDragging) {
      this.rotateKnob(e.clientY);
    }
  }
  
  handleMouseUp() {
    console.log("Mouse Up event triggered.");
    this.isDragging = false;
  }
  
  handleTouchStart(e) {

    this.isDragging = true;
    e.preventDefault(); // Prevent default behavior (scrolling)
    const touch = e.touches[0];
    this.rotateKnob(touch.clientY);
    this.lastRotation = this.rotation;
  }

  handleTouchMove(e) {
    if (this.isDragging) {
      e.preventDefault(); // Prevent default behavior (scrolling)
      const touch = e.touches[0];
      this.rotateKnob(touch.clientY);
    }
  }

  handleTouchEnd() {
    this.isDragging = false;
  }
  
rotateKnob(clientY) {
    const knobRect = this.knob.getBoundingClientRect();
    const centerY = knobRect.top + knobRect.height / 2;
    const deltaY = clientY - centerY;
    const sensitivity = 0.1; // Adjust sensitivity for slower rotation

    // Calculate the new rotation
    let newRotation = this.lastRotation - deltaY * sensitivity;

    // Adjust the rotation within a single turn
    newRotation %= 360;

    // Update rotation only if within boundaries
    if (newRotation >= 0 && newRotation <= 360) {
        // Check if spinning clockwise and at max value or spinning counterclockwise and at min value
        if ((deltaY < 0 && this.textBox.value === this.maxValue.toString()) || (deltaY > 0 && this.textBox.value === this.minValue.toString())) {
            return; // Stop spinning
        }

        this.rotation = newRotation;

        // Update text box value based on full rotations
        let value = Math.round(((this.rotation / 360) * (this.maxValue - this.minValue)) + this.minValue);

        // Handle overflow/underflow
        if (value > this.maxValue) {
            value = this.maxValue;
        } else if (value < this.minValue) {
            value = this.minValue;
        }

        this.textBox.value = value;

        this.knob.style.transform = `rotate(${this.rotation}deg)`;
    }

    // Update last rotation for subsequent drag actions
    this.lastRotation = this.rotation;
}
}

