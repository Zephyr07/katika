import {AfterViewInit, Component, OnInit} from '@angular/core';

import anime from 'animejs';

@Component({
  selector: 'app-wheel',
  templateUrl: './wheel.page.html',
  styleUrls: ['./wheel.page.scss'],
})
export class WheelPage implements AfterViewInit {
  result: string | null = null;
  highlightedIndex: number | null = null;

  segments = Array.from({ length: 20 }, (_, i) => ({
    text: `${(i + 1) * 10} Points`,
    color: this.getSegmentColor(i),
  }));

  private segmentCount = 20;
  private segmentAngle = 360 / this.segmentCount;

  ngAfterViewInit() {
    this.initializeWheel();
  }

  initializeWheel() {
    const canvas = document.getElementById('wheel') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }
    const ctx = canvas.getContext('2d')!;
    const radius = canvas.width / 2;
    const segmentAngle = (2 * Math.PI) / this.segmentCount;

    canvas.width = 300;
    canvas.height = 300;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(radius, radius);

    // Dessiner chaque segment avec couleur unique
    for (let i = 0; i < this.segmentCount; i++) {
      const angle = segmentAngle * i;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + segmentAngle);
      ctx.lineTo(0, 0);
      ctx.fillStyle = this.segments[i].color;
      ctx.fill();
      ctx.stroke();

      // Dessiner le texte
      ctx.save();
      ctx.rotate(angle + segmentAngle / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000';
      ctx.font = '16px Arial';
      ctx.fillText(this.segments[i].text, radius / 2 - 10, 0);
      ctx.restore();
    }

    ctx.translate(-radius, -radius); // Réinitialiser la translation
  }

  spinWheel() {
    const canvas = document.getElementById('wheel') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    const segmentCount = this.segments.length;
    const segmentAngle = 360 / segmentCount;
    const randomSegmentIndex = Math.floor(Math.random() * segmentCount);
    const angle = segmentAngle * randomSegmentIndex;
    const threeTurns = 360 * 3; // Trois tours complets
    const additionalTurns = 360 * (Math.floor(Math.random() * 5) + 3); // 3 à 7 tours supplémentaires
    const totalRotation = angle + threeTurns + additionalTurns; // Inclure trois tours et des tours supplémentaires

    this.highlightedIndex = null;
    // Animation de la roue
    anime({
      targets: canvas,
      rotate: {
        value: totalRotation,
        duration: 3000,
        easing: 'easeOutQuint'
      },
      update: (anim) => {
        const ctx = canvas.getContext('2d')!;
        const radius = canvas.width / 2;
        const currentRotation = anim.currentTime / anim.duration * totalRotation;
        const currentAngle = currentRotation % 360;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(radius, radius);

        // Dessiner chaque segment sans surlignage
        for (let i = 0; i < segmentCount; i++) {
          const angle = segmentAngle * i;
          const endAngle = angle + segmentAngle;

          // Si le segment est celui en surbrillance, on modifie sa couleur
          if (i === this.highlightedIndex) {
            ctx.fillStyle = this.highlightColor(this.segments[i].color);
          } else {
            ctx.fillStyle = this.segments[i].color;
          }

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, radius, angle * Math.PI / 180, endAngle * Math.PI / 180);
          ctx.lineTo(0, 0);
          ctx.fillStyle = this.segments[i].color;
          ctx.fill();
          ctx.stroke();

        }

        ctx.translate(-radius, -radius); // Réinitialiser la translation
      },
      complete: () => {
        // Calculer l'index du segment qui s'arrête sous le curseur (en haut)
        const finalAngle = totalRotation % 360;
        const selectedIndex = Math.floor(finalAngle / segmentAngle);
        this.highlightedIndex = selectedIndex; // Surbrillance du segment sélectionné
        this.result = this.segments[selectedIndex].text;
        console.log('Segment sélectionné:', this.result);
      }
    });
  }

  private getSegmentColor(index: number): string {
   const colors=['#FF0000','#00FF00','#0000FF','#FFFF00','#FF00FF','#00FFFF','#800000','#808000','#008000','#800080',
      '#008080','#000080','#FFA500','#FFC0CB','#A52A2A','#D2691E','#5F9EA0','#4B0082','#fafffb','#2E8B57'];
    return colors[index % colors.length];
  }

  // Fonction pour générer une couleur plus lumineuse pour la surbrillance
  private highlightColor(color: string): string {
    // Ici, on peut ajuster la luminosité pour faire ressortir la couleur
    const colorValue = parseInt(color.slice(1), 16); // Convertir couleur hex en nombre
    const r = Math.min(255, ((colorValue >> 16) + 50));
    const g = Math.min(255, (((colorValue >> 8) & 0x00FF) + 50));
    const b = Math.min(255, ((colorValue & 0x0000FF) + 50));
    return `rgb(${r}, ${g}, ${b})`; // Retourner la couleur en RGB plus lumineuse
  }
}
