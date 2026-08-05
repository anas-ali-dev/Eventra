import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ActivatedRoute, RouterLink } from '@angular/router';

import QRCode from 'qrcode';

import html2canvas from 'html2canvas';



import { NavbarComponent } from '../../components/navbar/navbar';

import { FooterComponent } from '../../components/footer/footer';

import { PageBackdropComponent } from '../../components/page-backdrop/page-backdrop';

import { BookingService, TicketPass } from '../../services/booking.service';



@Component({

  selector: 'app-ticket',

  standalone: true,

  imports: [

    CommonModule,

    RouterLink,

    NavbarComponent,

    FooterComponent,

    PageBackdropComponent

  ],

  templateUrl: './ticket.html',

  styleUrl: './ticket.css'

})

export class TicketComponent implements OnInit {



  loading = true;

  error = '';

  passes: TicketPass[] = [];

  qrByPass = new Map<string, string>();

  actionMessage = '';



  constructor(

    private route: ActivatedRoute,

    private bookingService: BookingService,

    private cdr: ChangeDetectorRef

  ) {}



  ngOnInit(): void {

    const ref = this.route.snapshot.paramMap.get('ref');

    const refsQuery = this.route.snapshot.queryParamMap.get('refs');

    const refs = refsQuery

      ? refsQuery.split(',').map(item => item.trim()).filter(Boolean)

      : (ref ? [ref] : []);



    if (!refs.length) {

      this.error = 'Invalid ticket reference.';

      this.loading = false;

      return;

    }



    void this.loadPasses(refs);

  }



  formatDate(iso: string): string {

    if (!iso) return '';

    const datePart = iso.includes('T') ? iso.split('T')[0] : iso;

    const date = new Date(datePart + 'T00:00:00');

    return date.toLocaleDateString('en-US', {

      weekday: 'long',

      year: 'numeric',

      month: 'long',

      day: 'numeric'

    });

  }



  qrFor(pass: TicketPass): string {

    return this.qrByPass.get(pass.passCode) || '';

  }



  async shareTicket(pass: TicketPass, index: number): Promise<void> {

    const shareText = [

      `Eventra Ticket — ${pass.event.title}`,

      `${pass.ticketTierName} · ${pass.entryGate}`,

      `Ticket ${index + 1} of ${this.passes.length}`,

      `Code: ${pass.passCode}`

    ].join('\n');



    if (navigator.share) {

      try {

        await navigator.share({

          title: `Eventra Ticket · ${pass.event.title}`,

          text: shareText,

          url: window.location.href

        });

        this.actionMessage = `Ticket ${index + 1} shared.`;

        return;

      } catch {

        // fall through

      }

    }



    try {

      await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);

      this.actionMessage = `Ticket ${index + 1} details copied.`;

    } catch {

      this.actionMessage = 'Could not share this ticket.';

    }

  }



  async downloadTicket(pass: TicketPass): Promise<void> {

    const card = document.getElementById(`ticket-${pass.passCode}`);

    if (!card) return;



    try {

      const canvas = await html2canvas(card, {

        backgroundColor: '#0b0f0c',

        scale: 2,

        useCORS: true

      });



      const link = document.createElement('a');

      link.href = canvas.toDataURL('image/png');

      link.download = `eventra-ticket-${pass.passCode}.png`;

      link.click();

      this.actionMessage = `Ticket ${pass.passCode} downloaded.`;

    } catch {

      this.actionMessage = 'Download failed for this ticket.';

    }

  }



  exportTicket(pass: TicketPass): void {

    const payload = {

      exportedAt: new Date().toISOString(),

      pass

    };



    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });

    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);

    link.download = `eventra-ticket-${pass.passCode}.json`;

    link.click();

    URL.revokeObjectURL(link.href);

    this.actionMessage = `Ticket ${pass.passCode} exported.`;

  }



  private async loadPasses(refs: string[]): Promise<void> {

    try {

      this.passes = await this.bookingService.getTicketPasses(refs);



      if (!this.passes.length) {

        throw new Error('No tickets found for this booking.');

      }



      await this.generateAllQrCodes();

    } catch (err) {

      this.error = err instanceof Error ? err.message : 'Could not load ticket.';

    } finally {

      this.loading = false;

      this.cdr.detectChanges();

    }

  }



  private async generateAllQrCodes(): Promise<void> {

    this.qrByPass.clear();



    for (const pass of this.passes) {

      const payload = JSON.stringify({

        passCode: pass.passCode,

        bookingRef: pass.bookingRef,

        event: pass.event.title,

        tier: pass.ticketTierName,

        gate: pass.entryGate,

        holder: pass.holderEmail

      });



      const qr = await QRCode.toDataURL(payload, {

        width: 220,

        margin: 1,

        color: {

          dark: '#071109',

          light: '#ffffff'

        }

      });



      this.qrByPass.set(pass.passCode, qr);

    }

  }

}

